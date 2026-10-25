export interface IndianState {
  name: string;
  districts: string[];
  defaultLanguage: 'kn' | 'ta' | 'te' | 'en';
}

export const INDIAN_STATES: IndianState[] = [
  {
    name: 'Karnataka',
    defaultLanguage: 'kn',
    districts: [
      'Bagalkote', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
      'Bidar', 'Chamarajanagar', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga',
      'Dakshina Kannada', 'Davangere', 'Dharwad', 'Gadag', 'Hassan',
      'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal',
      'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga',
      'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayanagara', 'Vijayapura', 'Yadgir'
    ]
  },
  {
    name: 'Tamil Nadu',
    defaultLanguage: 'ta',
    districts: [
      'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
      'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
      'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
      'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
      'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
      'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
      'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
      'Vellore', 'Viluppuram', 'Virudhunagar'
    ]
  },
  {
    name: 'Andhra Pradesh',
    defaultLanguage: 'te',
    districts: [
      'Alluri Sitharama Raju', 'Anakapalli', 'Ananthapuramu', 'Annamayya', 'Bapatla',
      'Chittoor', 'Dr. B.R. Ambedkar Konaseema', 'East Godavari', 'Eluru', 'Guntur',
      'Kakinada', 'Krishna', 'Kurnool', 'Nandyal', 'NTR',
      'Palnadu', 'Parvathipuram Manyam', 'Prakasam', 'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai',
      'Srikakulam', 'Tirupati', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa'
    ]
  },
  {
    name: 'Telangana',
    defaultLanguage: 'te',
    districts: [
      'Adilabad', 'Bhadradri Kothagudem', 'Hanumakonda', 'Hyderabad', 'Jagtial',
      'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar',
      'Khammam', 'Kumuram Bheem Asifabad', 'Mahabubabad', 'Mahabubnagar', 'Mancherial',
      'Medak', 'Medchal Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda',
      'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla',
      'Ranga Reddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad',
      'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri'
    ]
  },
  {
    name: 'Kerala',
    defaultLanguage: 'en',
    districts: [
      'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod',
      'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
      'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
    ]
  },
  {
    name: 'Maharashtra',
    defaultLanguage: 'en',
    districts: [
      'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad (Chhatrapati Sambhajinagar)', 'Beed', 'Bhandara', 'Buldhana',
      'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon',
      'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur',
      'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad (Dharashiv)', 'Palghar', 'Parbhani',
      'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg',
      'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
    ]
  },
  {
    name: 'Gujarat',
    defaultLanguage: 'en',
    districts: [
      'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar',
      'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar',
      'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar',
      'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan',
      'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi',
      'Vadodara', 'Valsad'
    ]
  },
  {
    name: 'Madhya Pradesh',
    defaultLanguage: 'en',
    districts: [
      'Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas', 'Satna',
      'Ratlam', 'Rewa', 'Murwara (Katni)', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena',
      'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Chhatarpur', 'Damoh',
      'Mandsaur', 'Khargone', 'Neemuch', 'Panna', 'Sehore', 'Hoshangabad (Narmadapuram)'
    ]
  },
  {
    name: 'Rajasthan',
    defaultLanguage: 'en',
    districts: [
      'Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner',
      'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Hanumangarh',
      'Jaipur', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Kota',
      'Nagaur', 'Pali', 'Pratapgarh', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi',
      'Sri Ganganagar', 'Tonk', 'Udaipur'
    ]
  },
  {
    name: 'Uttar Pradesh',
    defaultLanguage: 'en',
    districts: [
      'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Ayodhya',
      'Azamgarh', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki',
      'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli',
      'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad',
      'Gautam Buddha Nagar', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur',
      'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat',
      'Kanpur Nagar', 'Kasganj', 'Kaushambi', 'Kheri', 'Kushinagar', 'Lalitpur', 'Lucknow',
      'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad',
      'Muzaffarnagar', 'Pilibhit', 'Pratapgarh', 'Prayagraj', 'Raebareli', 'Rampur', 'Saharanpur',
      'Sambhal', 'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar',
      'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'
    ]
  },
  {
    name: 'Punjab',
    defaultLanguage: 'en',
    districts: [
      'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka',
      'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana',
      'Malerkotla', 'Mansa', 'Moga', 'Muktsar', 'Pathankot', 'Patiala', 'Rupnagar',
      'Sahibzada Ajit Singh Nagar (Mohali)', 'Sangrur', 'Shahid Bhagat Singh Nagar (Nawanshahr)', 'Tarn Taran'
    ]
  },
  {
    name: 'Haryana',
    defaultLanguage: 'en',
    districts: [
      'Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram',
      'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh',
      'Nuh', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa',
      'Sonipat', 'Yamunanagar'
    ]
  },
  {
    name: 'Bihar',
    defaultLanguage: 'en',
    districts: [
      'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur',
      'Buxar', 'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad',
      'Kaimur', 'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani',
      'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa',
      'Samastipur', 'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul',
      'Vaishali', 'West Champaran'
    ]
  },
  {
    name: 'West Bengal',
    defaultLanguage: 'en',
    districts: [
      'Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling',
      'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata', 'Malda',
      'Murshidabad', 'Nadia', 'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur',
      'Purba Bardhaman', 'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'
    ]
  },
  {
    name: 'Odisha',
    defaultLanguage: 'en',
    districts: [
      'Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack',
      'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghpur', 'Jajpur',
      'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar (Keonjhar)',
      'Khordha', 'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh',
      'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur (Sonepur)', 'Sundargarh'
    ]
  },
  {
    name: 'Assam',
    defaultLanguage: 'en',
    districts: [
      'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo', 'Chirang',
      'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao', 'Goalpara', 'Golaghat',
      'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong',
      'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari',
      'Sivasagar', 'Sonitpur', 'South Salmara-Mankachar', 'Tinsukia', 'Udalguri', 'West Karbi Anglong'
    ]
  },
  {
    name: 'Delhi',
    defaultLanguage: 'en',
    districts: [
      'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi',
      'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'
    ]
  },
  {
    name: 'Goa',
    defaultLanguage: 'en',
    districts: ['North Goa', 'South Goa']
  },
  {
    name: 'Himachal Pradesh',
    defaultLanguage: 'en',
    districts: [
      'Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu',
      'Lahaul and Spiti', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una'
    ]
  },
  {
    name: 'Uttarakhand',
    defaultLanguage: 'en',
    districts: [
      'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar',
      'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal',
      'Udham Singh Nagar', 'Uttarkashi'
    ]
  },
  {
    name: 'Jharkhand',
    defaultLanguage: 'en',
    districts: [
      'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Garhwa',
      'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma',
      'Latehar', 'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahebganj',
      'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'
    ]
  },
  {
    name: 'Chhattisgarh',
    defaultLanguage: 'en',
    districts: [
      'Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara', 'Bijapur',
      'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg', 'Gariaband', 'Gaurela-Pendra-Marwahi',
      'Janjgir-Champa', 'Jashpur', 'Kabirdham', 'Kanker', 'Kondagaon', 'Korba',
      'Koriya', 'Mahasamund', 'Mungeli', 'Narayanpur', 'Raigarh', 'Raipur',
      'Rajnandgaon', 'Sukma', 'Surajpur', 'Surguja'
    ]
  }
];

// Synonyms map: variations -> canonical name
export const STATE_SYNONYMS: Record<string, string> = {
  'ka': 'Karnataka',
  'karnatka': 'Karnataka',
  'mysore state': 'Karnataka',
  'tn': 'Tamil Nadu',
  'tamilnadu': 'Tamil Nadu',
  'madras state': 'Tamil Nadu',
  'ap': 'Andhra Pradesh',
  'andhra': 'Andhra Pradesh',
  'andhrapradesh': 'Andhra Pradesh',
  'ts': 'Telangana',
  'tg': 'Telangana',
  'telengana': 'Telangana',
  'kl': 'Kerala',
  'keralam': 'Kerala',
  'mh': 'Maharashtra',
  'orissa': 'Odisha',
  'uttaranchal': 'Uttarakhand',
  'pondicherry': 'Puducherry',
  'nct of delhi': 'Delhi',
  'new delhi': 'Delhi',
};

export const DISTRICT_SYNONYMS: Record<string, string> = {
  // Karnataka
  'mysore': 'Mysuru',
  'mysuru': 'Mysuru',
  'bangalore': 'Bengaluru Urban',
  'bangalore urban': 'Bengaluru Urban',
  'bengaluru': 'Bengaluru Urban',
  'bengaluru urban': 'Bengaluru Urban',
  'bangalore rural': 'Bengaluru Rural',
  'bengaluru rural': 'Bengaluru Rural',
  'belgaum': 'Belagavi',
  'belagavi': 'Belagavi',
  'shimoga': 'Shivamogga',
  'shivamogga': 'Shivamogga',
  'tumkur': 'Tumakuru',
  'tumakuru': 'Tumakuru',
  'chikmagalur': 'Chikkamagaluru',
  'chikkamangalore': 'Chikkamagaluru',
  'chikkamagaluru': 'Chikkamagaluru',
  'gulbarga': 'Kalaburagi',
  'kalaburagi': 'Kalaburagi',
  'bijapur': 'Vijayapura',
  'vijayapura': 'Vijayapura',
  'bellary': 'Ballari',
  'ballari': 'Ballari',
  'davanagere': 'Davangere',
  'davangere': 'Davangere',
  'chamarajnagar': 'Chamarajanagar',
  'chamarajanagara': 'Chamarajanagar',
  'chamarajanagar': 'Chamarajanagar',
  'ramanagar': 'Ramanagara',
  'ramanagara': 'Ramanagara',
  'chikballapur': 'Chikkaballapura',
  'chikkaballapur': 'Chikkaballapura',
  'chikkaballapura': 'Chikkaballapura',
  'north canara': 'Uttara Kannada',
  'uttar kannada': 'Uttara Kannada',
  'uttara kannada': 'Uttara Kannada',
  'south canara': 'Dakshina Kannada',
  'dakshin kannada': 'Dakshina Kannada',
  'dakshina kannada': 'Dakshina Kannada',
  'mangalore': 'Dakshina Kannada',
  'mangaluru': 'Dakshina Kannada',
  'bagalkot': 'Bagalkote',
  'bagalkote': 'Bagalkote',
  'yadagiri': 'Yadgir',
  'yadgir': 'Yadgir',
  'coorg': 'Kodagu',
  'kodagu': 'Kodagu',

  // Tamil Nadu
  'madras': 'Chennai',
  'chennai': 'Chennai',
  'kancheepuram': 'Kanchipuram',
  'kanchipuram': 'Kanchipuram',
  'trichy': 'Tiruchirappalli',
  'tiruchi': 'Tiruchirappalli',
  'tiruchirappalli': 'Tiruchirappalli',
  'tanjore': 'Thanjavur',
  'thanjavur': 'Thanjavur',
  'nellai': 'Tirunelveli',
  'tirunelveli': 'Tirunelveli',
  'kanyakumari': 'Kanniyakumari',
  'kanniyakumari': 'Kanniyakumari',
  'villupuram': 'Viluppuram',
  'viluppuram': 'Viluppuram',
  'tuticorin': 'Thoothukudi',
  'thoothukudi': 'Thoothukudi',
  'ooty': 'Nilgiris',
  'the nilgiris': 'Nilgiris',
  'nilgiris': 'Nilgiris',

  // Andhra Pradesh
  'vizag': 'Visakhapatnam',
  'visakhapatnam': 'Visakhapatnam',
  'cuddapah': 'YSR Kadapa',
  'kadapa': 'YSR Kadapa',
  'ysr kadapa': 'YSR Kadapa',
  'nellore': 'Sri Potti Sriramulu Nellore',
  'sri potti sriramulu nellore': 'Sri Potti Sriramulu Nellore',
  'kakinada': 'Kakinada',
  'rajahmundry': 'East Godavari',

  // Telangana
  'secunderabad': 'Hyderabad',
  'hyderabad': 'Hyderabad',
  'palamuru': 'Mahabubnagar',
  'mahabubnagar': 'Mahabubnagar',
  'orugallu': 'Warangal',
  'warangal': 'Warangal',

  // Kerala
  'trivandrum': 'Thiruvananthapuram',
  'thiruvananthapuram': 'Thiruvananthapuram',
  'calicut': 'Kozhikode',
  'kozhikode': 'Kozhikode',
  'quilon': 'Kollam',
  'kollam': 'Kollam',
  'alleppey': 'Alappuzha',
  'alappuzha': 'Alappuzha',
  'trichur': 'Thrissur',
  'thrissur': 'Thrissur',
  'palghat': 'Palakkad',
  'palakkad': 'Palakkad',
  'cannanore': 'Kannur',
  'kannur': 'Kannur',
};

// String normalization helper
function normalize(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+district$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Levenshtein distance calculation
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Match a raw geocoded state name to a canonical state from the dropdown list.
 */
export function matchState(rawState: string): IndianState | null {
  if (!rawState) return null;
  const norm = normalize(rawState);

  // 1. Synonym lookup
  if (STATE_SYNONYMS[norm]) {
    const canonical = STATE_SYNONYMS[norm];
    const found = INDIAN_STATES.find(s => s.name.toLowerCase() === canonical.toLowerCase());
    if (found) return found;
  }

  // 2. Direct exact or substring match
  for (const s of INDIAN_STATES) {
    const sNorm = normalize(s.name);
    if (sNorm === norm || sNorm.includes(norm) || norm.includes(sNorm)) {
      return s;
    }
  }

  // 3. Fuzzy Levenshtein match (max distance 2)
  for (const s of INDIAN_STATES) {
    const sNorm = normalize(s.name);
    if (levenshtein(sNorm, norm) <= 2) {
      return s;
    }
  }

  return null;
}

/**
 * Match a raw geocoded district name to one of the districts of the selected state.
 * Returns { district: string, isConfident: boolean }
 */
export function matchDistrict(
  rawDistrict: string,
  state: IndianState
): { district: string; isConfident: boolean } | null {
  if (!rawDistrict || !state || !state.districts || state.districts.length === 0) {
    return null;
  }

  const norm = normalize(rawDistrict);

  // 1. Synonym lookup
  if (DISTRICT_SYNONYMS[norm]) {
    const canonical = DISTRICT_SYNONYMS[norm];
    const found = state.districts.find(d => d.toLowerCase() === canonical.toLowerCase());
    if (found) {
      return { district: found, isConfident: true };
    }
  }

  // 2. Exact match
  for (const d of state.districts) {
    if (normalize(d) === norm) {
      return { district: d, isConfident: true };
    }
  }

  // 3. Substring match (e.g. "Mysuru" in "Mysuru District" or "Bengaluru" in "Bengaluru Urban")
  for (const d of state.districts) {
    const dNorm = normalize(d);
    if ((dNorm.length >= 4 && norm.includes(dNorm)) || (norm.length >= 4 && dNorm.includes(norm))) {
      return { district: d, isConfident: true };
    }
  }

  // 4. Fuzzy Levenshtein match with high confidence (distance <= 2 for strings > 5 chars)
  let bestMatch: string | null = null;
  let minDistance = 999;

  for (const d of state.districts) {
    const dNorm = normalize(d);
    const dist = levenshtein(dNorm, norm);
    if (dist < minDistance && dist <= (dNorm.length > 5 ? 2 : 1)) {
      minDistance = dist;
      bestMatch = d;
    }
  }

  if (bestMatch) {
    return { district: bestMatch, isConfident: true };
  }

  // No confident match: return null so dropdown remains empty and farmer chooses
  return null;
}
