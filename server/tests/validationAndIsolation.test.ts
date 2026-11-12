import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { resetAndSeedTestDb } from './testHelpers';

async function registerSecondUser() {
  const phone = '9812345678';
  await request(app).post('/api/auth/send-otp').send({ phone, purpose: 'register' });
  const ver = await request(app)
    .post('/api/auth/verify-otp')
    .send({ phone, otp: '123456', purpose: 'register' });
  const reg = await request(app).post('/api/auth/register').send({
    name: 'Lakshmi Devi',
    phone,
    verificationToken: ver.body.data.verificationToken,
    district: 'Mysuru',
    state: 'Karnataka',
    language: 'kn',
  });
  return reg.body.data.token as string;
}

describe('Input Validation & Per-User Ownership Isolation', () => {
  let tokenA = '';
  let tokenB = '';

  beforeEach(async () => {
    process.env.DEMO_MODE = 'true';
    process.env.DEMO_OTP_ENABLED = 'true';
    await resetAndSeedTestDb();
    const demoRes = await request(app).post('/api/auth/demo-login').send({});
    tokenA = demoRes.body.data.token;
    tokenB = await registerSecondUser();
  });

  it('rejects invalid inputs with 400 or 404 across lifecycle, profile, soil, crops, and diseases', async () => {
    // Unknown cropId must NOT silently fall back to Paddy (must return 404)
    const unknownPlan = await request(app)
      .post('/api/lifecycle/plans')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ cropId: 'invalid-crop-id', fieldName: 'Plot X', areaAcre: 2 });
    expect(unknownPlan.status).toBe(404);

    // Invalid areaAcre
    const badArea = await request(app)
      .post('/api/lifecycle/plans')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ cropId: 'crop-paddy-rice', areaAcre: -5 });
    expect(badArea.status).toBe(400);

    // Profile PATCH & PUT validation
    const blankNamePatch = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: '   ' });
    expect(blankNamePatch.status).toBe(400);

    const badLangPut = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ language: 'fr' });
    expect(badLangPut.status).toBe(400);

    const badCoordsPut = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ latitude: 95 });
    expect(badCoordsPut.status).toBe(400);

    // Soil assessment validation
    const badSoil = await request(app)
      .post('/api/soil/assessments')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ soilType: 'red', waterSource: 'borewell', ph: 20 });
    expect(badSoil.status).toBe(400);

    // Quick crop recommend validation
    const badRec = await request(app)
      .post('/api/crops/recommend')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ ph: -2 });
    expect(badRec.status).toBe(400);

    // Disease feedback validation
    const badFeedback = await request(app)
      .post('/api/diseases/feedback')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ problemSlug: 'blast', rating: 'maybe' });
    expect(badFeedback.status).toBe(400);
  });

  it('isolates User A resources from User B across soil, crop plans/tasks, and chat', async () => {
    // User A creates a Soil Assessment
    const soilRes = await request(app)
      .post('/api/soil/assessments')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ soilType: 'loamy', waterSource: 'canal', season: 'Kharif', ph: 6.5 });
    expect(soilRes.status).toBe(200);
    const assessmentId = soilRes.body.data.assessment.id;

    // User B cannot view User A's soil assessment
    const crossSoil = await request(app)
      .get(`/api/soil/assessments/${assessmentId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(crossSoil.status).toBe(404);

    // User A creates a Crop Plan
    const planRes = await request(app)
      .post('/api/lifecycle/plans')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ cropId: 'crop-paddy-rice', fieldName: 'Canal Plot', areaAcre: 1.5 });
    expect(planRes.status).toBe(200);
    const planId = planRes.body.data.id;
    const taskId = planRes.body.data.tasks[0].id;

    // User B cannot view/delete User A's plan or toggle User A's task
    const crossGetPlan = await request(app)
      .get(`/api/lifecycle/plans/${planId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(crossGetPlan.status).toBe(404);

    const crossTask = await request(app)
      .patch(`/api/lifecycle/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ isCompleted: true });
    expect(crossTask.status).toBe(403);

    const crossDeletePlan = await request(app)
      .delete(`/api/lifecycle/plans/${planId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(crossDeletePlan.status).toBe(404);

    // User A creates a Chat Conversation via SSE endpoint
    const chatRes = await request(app)
      .post('/api/chat/messages')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ message: 'How to manage yellow stem borer in paddy?', language: 'en' });
    expect(chatRes.status).toBe(200);
    const doneMatch = chatRes.text.match(/event: done\ndata: (.+)\n/);
    expect(doneMatch).toBeTruthy();
    const convId = JSON.parse(doneMatch![1]).conversationId;
    expect(convId).toBeTruthy();

    // User B cannot read, append to, or delete User A's chat conversation
    const crossChatGet = await request(app)
      .get(`/api/chat/conversations/${convId}/messages`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(crossChatGet.status).toBe(404);

    const crossChatPost = await request(app)
      .post('/api/chat/messages')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ conversationId: convId, message: 'Steal history', language: 'en' });
    expect(crossChatPost.status).toBe(403);

    const crossChatDel = await request(app)
      .delete(`/api/chat/conversations/${convId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(crossChatDel.status).toBe(404);
  });
});

