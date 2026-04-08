// https:countrycode.org/
// https://en.wikipedia.org/wiki/List_of_country_calling_codes
// https://www.iso.org/obp/ui/#iso:pub:PUB500001:en
// https://github.com/JeremyPersing/countryflagsapi
// https://flagpedia.net/download/vector

export interface Country {
  name: string;
  iso2: string;
  iso3: string;
  code: string;
}

export const countries: Array<Country> = [
  // Zone 1
  // +1 USA
  { name: "United States", iso2: "US", iso3: "USA", code: "1" },
  { name: "U.S. Virgin Islands", iso2: "VI", iso3: "VIR", code: "1 (340)" },
  {
    name: "Northern Mariana Islands",
    iso2: "MP",
    iso3: "MNP",
    code: "1 (670)"
  },
  { name: "Guam", iso2: "GU", iso3: "GUM", code: "1 (671)" },
  { name: "American Samoa", iso2: "AS", iso3: "ASM", code: "1 (684)" },
  { name: "Puerto Rico", iso2: "PR", iso3: "PRI", code: "1" }, // +1 (787, 939)

  // +1 Canada
  { name: "Canada", iso2: "CA", iso3: "CAN", code: "1" },

  // +1 Caribbean
  { name: "Bahamas", iso2: "BS", iso3: "BHS", code: "1 (242)" },
  { name: "Barbados", iso2: "BB", iso3: "BRB", code: "1 (246)" },
  { name: "Anguilla", iso2: "AI", iso3: "AIA", code: "1 (264)" },
  { name: "Antigua and Barbuda", iso2: "AG", iso3: "ATG", code: "1 (268)" },
  {
    name: "British Virgin Islands",
    iso2: "VG",
    iso3: "VGB",
    code: "1 (284)"
  },
  { name: "Cayman Islands", iso2: "KY", iso3: "CYM", code: "1 (345)" },
  { name: "Bermuda", iso2: "BM", iso3: "BMU", code: "1 (441)" },
  { name: "Grenada", iso2: "GD", iso3: "GRD", code: "1 (473)" },
  {
    name: "Turks and Caicos Islands",
    iso2: "TC",
    iso3: "TCA",
    code: "1 (649)"
  },
  { name: "Jamaica", iso2: "JM", iso3: "JAM", code: "1" }, // +1 (658, 876)
  { name: "Montserrat", iso2: "MS", iso3: "MSR", code: "1 (664)" },
  { name: "Sint Maarten", iso2: "SX", iso3: "SXM", code: "1 (721)" },
  { name: "Saint Lucia", iso2: "LC", iso3: "LCA", code: "1 (758)" },
  { name: "Dominica", iso2: "DM", iso3: "DMA", code: "1 (767)" },
  {
    name: "Saint Vincent and the Grenadines",
    iso2: "VC",
    iso3: "VCT",
    code: "1 (784)"
  },
  { name: "Dominican Republic", iso2: "DO", iso3: "DOM", code: "1" }, // +1 (809, 829, 849)
  { name: "Trinidad and Tobago", iso2: "TT", iso3: "TTO", code: "1 (868)" },
  { name: "Saint Kitts and Nevis", iso2: "KN", iso3: "KNA", code: "1 (869)" },

  // Zone 2
  { name: "Egypt", iso2: "EG", iso3: "EGY", code: "20" },
  { name: "South Sudan", iso2: "SS", iso3: "SSD", code: "211" },
  { name: "Morocco", iso2: "MA", iso3: "MAR", code: "212" },
  { name: "Western Sahara", iso2: "EH", iso3: "ESH", code: "212" },
  { name: "Algeria", iso2: "DZ", iso3: "DZA", code: "213" },
  { name: "Tunisia", iso2: "TN", iso3: "TUN", code: "216" },
  { name: "Libya", iso2: "LY", iso3: "LBY", code: "218" },
  { name: "Gambia", iso2: "GM", iso3: "GMB", code: "220" },
  { name: "Senegal", iso2: "SN", iso3: "SEN", code: "221" },
  { name: "Mauritania", iso2: "MR", iso3: "MRT", code: "222" },
  { name: "Mali", iso2: "ML", iso3: "MLI", code: "223" },
  { name: "Guinea", iso2: "GN", iso3: "GIN", code: "224" },
  {
    name: "Côte d'Ivoire (Ivory Coast)",
    iso2: "CI",
    iso3: "CIV",
    code: "225"
  },
  { name: "Burkina Faso", iso2: "BF", iso3: "BFA", code: "226" },
  { name: "Niger", iso2: "NE", iso3: "NER", code: "227" },
  { name: "Togo", iso2: "TG", iso3: "TGO", code: "228" },
  { name: "Benin", iso2: "BJ", iso3: "BEN", code: "229" },
  { name: "Mauritius", iso2: "MU", iso3: "MUS", code: "230" },
  { name: "Liberia", iso2: "LR", iso3: "LBR", code: "231" },
  { name: "Sierra Leone", iso2: "SL", iso3: "SLE", code: "232" },
  { name: "Ghana", iso2: "GH", iso3: "GHA", code: "233" },
  { name: "Nigeria", iso2: "NG", iso3: "NGA", code: "234" },
  { name: "Chad", iso2: "TD", iso3: "TCD", code: "235" },
  { name: "Central African Republic", iso2: "CF", iso3: "CAF", code: "236" },
  { name: "Cameroon", iso2: "CM", iso3: "CMR", code: "237" },
  { name: "Cape Verde", iso2: "CV", iso3: "CPV", code: "238" },
  { name: "Sao Tome and Principe", iso2: "ST", iso3: "STP", code: "239" },
  { name: "Equatorial Guinea", iso2: "GQ", iso3: "GNQ", code: "240" },
  { name: "Gabon", iso2: "GA", iso3: "GAB", code: "241" },
  { name: "Republic of the Congo", iso2: "CG", iso3: "COG", code: "242" },
  {
    name: "Democratic Republic of the Congo",
    iso2: "CD",
    iso3: "COD",
    code: "243"
  },
  { name: "Angola", iso2: "AO", iso3: "AGO", code: "244" },
  { name: "Guinea-Bissau", iso2: "GW", iso3: "GNB", code: "245" },
  {
    name: "British Indian Ocean Territory",
    iso2: "IO",
    iso3: "IOT",
    code: "246"
  },
  {
    name: "United States Minor Outlying Islands",
    iso2: "UM",
    iso3: "UMI",
    code: "246"
  },
  {
    name: "Ascension Island",
    iso2: "AC",
    iso3: "ASC",
    code: "247"
  },
  { name: "Seychelles", iso2: "SC", iso3: "SYC", code: "248" },
  { name: "Sudan", iso2: "SD", iso3: "SDN", code: "249" },
  { name: "Rwanda", iso2: "RW", iso3: "RWA", code: "250" },
  { name: "Ethiopia", iso2: "ET", iso3: "ETH", code: "251" },
  { name: "Somalia", iso2: "SO", iso3: "SOM", code: "252" },
  { name: "Djibouti", iso2: "DJ", iso3: "DJI", code: "253" },
  { name: "Kenya", iso2: "KE", iso3: "KEN", code: "254" },
  { name: "Tanzania", iso2: "TZ", iso3: "TZA", code: "255" },
  { name: "Uganda", iso2: "UG", iso3: "UGA", code: "256" },
  { name: "Burundi", iso2: "BI", iso3: "BDI", code: "257" },
  { name: "Mozambique", iso2: "MZ", iso3: "MOZ", code: "258" },
  { name: "Zambia", iso2: "ZM", iso3: "ZMB", code: "260" },
  { name: "Madagascar", iso2: "MG", iso3: "MDG", code: "261" },
  {
    name: "French Southern and Antarctic Lands",
    iso2: "TF",
    iso3: "ATF",
    code: "262"
  },
  { name: "Reunion", iso2: "RE", iso3: "REU", code: "262" },
  { name: "Mayotte", iso2: "YT", iso3: "MYT", code: "262" }, // +262 (269, 639)
  { name: "Zimbabwe", iso2: "ZW", iso3: "ZWE", code: "263" },
  { name: "Namibia", iso2: "NA", iso3: "NAM", code: "264" },
  { name: "Malawi", iso2: "MW", iso3: "MWI", code: "265" },
  { name: "Lesotho", iso2: "LS", iso3: "LSO", code: "266" },
  { name: "Botswana", iso2: "BW", iso3: "BWA", code: "267" },
  { name: "Eswatini (Swaziland)", iso2: "SZ", iso3: "SWZ", code: "268" },
  { name: "Comoros", iso2: "KM", iso3: "COM", code: "269" },
  { name: "South Africa", iso2: "ZA", iso3: "ZAF", code: "27" },
  { name: "Saint Helena", iso2: "SH", iso3: "SHN", code: "290" },
  { name: "Tristan da Cunha", iso2: "TA", iso3: "TAA", code: "290 (8)" },
  { name: "Eritrea", iso2: "ER", iso3: "ERI", code: "291" },
  { name: "Aruba", iso2: "AW", iso3: "ABW", code: "297" },
  { name: "Faroe Islands", iso2: "FO", iso3: "FRO", code: "298" },
  { name: "Greenland", iso2: "GL", iso3: "GRL", code: "299" },

  // Zone 3
  { name: "Greece", iso2: "GR", iso3: "GRC", code: "30" },
  { name: "Netherlands", iso2: "NL", iso3: "NLD", code: "31" },
  { name: "Belgium", iso2: "BE", iso3: "BEL", code: "32" },
  { name: "France", iso2: "FR", iso3: "FRA", code: "33" },
  { name: "Spain", iso2: "ES", iso3: "ESP", code: "34" },
  { name: "Gibraltar", iso2: "GI", iso3: "GIB", code: "350" },
  { name: "Portugal", iso2: "PT", iso3: "PRT", code: "351" },
  { name: "Luxembourg", iso2: "LU", iso3: "LUX", code: "352" },
  { name: "Ireland", iso2: "IE", iso3: "IRL", code: "353" },
  { name: "Iceland", iso2: "IS", iso3: "ISL", code: "354" },
  { name: "Albania", iso2: "AL", iso3: "ALB", code: "355" },
  { name: "Malta", iso2: "MT", iso3: "MLT", code: "356" },
  { name: "Cyprus", iso2: "CY", iso3: "CYP", code: "357" },
  { name: "Finland", iso2: "FI", iso3: "FIN", code: "358" },
  { name: "Åland Islands", iso2: "AX", iso3: "ALA", code: "358 (18)" },
  { name: "Bulgaria", iso2: "BG", iso3: "BGR", code: "359" },
  { name: "Hungary", iso2: "HU", iso3: "HUN", code: "36" },
  { name: "Lithuania", iso2: "LT", iso3: "LTU", code: "370" },
  { name: "Latvia", iso2: "LV", iso3: "LVA", code: "371" },
  { name: "Estonia", iso2: "EE", iso3: "EST", code: "372" },
  { name: "Moldova", iso2: "MD", iso3: "MDA", code: "373" },
  { name: "Armenia", iso2: "AM", iso3: "ARM", code: "374" },
  { name: "Belarus", iso2: "BY", iso3: "BLR", code: "375" },
  { name: "Andorra", iso2: "AD", iso3: "AND", code: "376" },
  { name: "Monaco", iso2: "MC", iso3: "MCO", code: "377" },
  { name: "San Marino", iso2: "SM", iso3: "SMR", code: "378" },
  { name: "Vatican", iso2: "VA", iso3: "VAT", code: "379" },
  { name: "Ukraine", iso2: "UA", iso3: "UKR", code: "380" },
  { name: "Serbia", iso2: "RS", iso3: "SRB", code: "381" },
  { name: "Montenegro", iso2: "ME", iso3: "MNE", code: "382" },
  { name: "Kosovo", iso2: "XK", iso3: "XKX", code: "383" },
  { name: "Croatia", iso2: "HR", iso3: "HRV", code: "385" },
  { name: "Slovenia", iso2: "SI", iso3: "SVN", code: "386" },
  { name: "Bosnia and Herzegovina", iso2: "BA", iso3: "BIH", code: "387" },
  { name: "Macedonia", iso2: "MK", iso3: "MKD", code: "389" },
  { name: "Italy", iso2: "IT", iso3: "ITA", code: "39" },

  // Zone 4
  { name: "Romania", iso2: "RO", iso3: "ROU", code: "40" },
  { name: "Switzerland", iso2: "CH", iso3: "CHE", code: "41" },
  { name: "Czech Republic", iso2: "CZ", iso3: "CZE", code: "420" },
  { name: "Slovakia", iso2: "SK", iso3: "SVK", code: "421" },
  { name: "Liechtenstein", iso2: "LI", iso3: "LIE", code: "423" },
  { name: "Austria", iso2: "AT", iso3: "AUT", code: "43" },
  { name: "United Kingdom", iso2: "GB", iso3: "GBR", code: "44" },
  { name: "Guernsey", iso2: "GG", iso3: "GGY", code: "44 (1481)" },
  { name: "Jersey", iso2: "JE", iso3: "JEY", code: "44 (1534)" },
  { name: "Isle of Man", iso2: "IM", iso3: "IMN", code: "44 (1624)" },
  { name: "Denmark", iso2: "DK", iso3: "DNK", code: "45" },
  { name: "Sweden", iso2: "SE", iso3: "SWE", code: "46" },
  { name: "Norway", iso2: "NO", iso3: "NOR", code: "47" },
  {
    name: "Svalbard and Jan Mayen",
    iso2: "SJ",
    iso3: "SJM",
    code: "47 (79)"
  },
  { name: "Poland", iso2: "PL", iso3: "POL", code: "48" },
  { name: "Germany", iso2: "DE", iso3: "DEU", code: "49" },

  // Zone 5
  { name: "Falkland Islands", iso2: "FK", iso3: "FLK", code: "500" },
  {
    name: "South Georgia and the South Sandwich Islands",
    iso2: "GS",
    iso3: "SGS",
    code: "500"
  },
  { name: "Belize", iso2: "BZ", iso3: "BLZ", code: "501" },
  { name: "Guatemala", iso2: "GT", iso3: "GTM", code: "502" },
  { name: "El Salvador", iso2: "SV", iso3: "SLV", code: "503" },
  { name: "Honduras", iso2: "HN", iso3: "HND", code: "504" },
  { name: "Nicaragua", iso2: "NI", iso3: "NIC", code: "505" },
  { name: "Costa Rica", iso2: "CR", iso3: "CRI", code: "506" },
  { name: "Panama", iso2: "PA", iso3: "PAN", code: "507" },
  { name: "Saint Pierre and Miquelon", iso2: "PM", iso3: "SPM", code: "508" },
  { name: "Haiti", iso2: "HT", iso3: "HTI", code: "509" },
  { name: "Peru", iso2: "PE", iso3: "PER", code: "51" },
  { name: "Mexico", iso2: "MX", iso3: "MEX", code: "52" },
  { name: "Cuba", iso2: "CU", iso3: "CUB", code: "53" },
  { name: "Argentina", iso2: "AR", iso3: "ARG", code: "54" },
  { name: "Brazil", iso2: "BR", iso3: "BRA", code: "55" },
  { name: "Chile", iso2: "CL", iso3: "CHL", code: "56" },
  { name: "Colombia", iso2: "CO", iso3: "COL", code: "57" },
  { name: "Venezuela", iso2: "VE", iso3: "VEN", code: "58" },
  { name: "Guadeloupe", iso2: "GP", iso3: "GLP", code: "590" },
  { name: "Saint Barthelemy", iso2: "BL", iso3: "BLM", code: "590" },
  { name: "Saint Martin", iso2: "MF", iso3: "MAF", code: "590" },
  { name: "Bolivia", iso2: "BO", iso3: "BOL", code: "591" },
  { name: "Guyana", iso2: "GY", iso3: "GUY", code: "592" },
  { name: "Ecuador", iso2: "EC", iso3: "ECU", code: "593" },
  { name: "French Guiana", iso2: "GF", iso3: "GUF", code: "594" },
  { name: "Paraguay", iso2: "PY", iso3: "PRY", code: "595" },
  { name: "Martinique", iso2: "MQ", iso3: "MTQ", code: "596" },
  { name: "Suriname", iso2: "SR", iso3: "SUR", code: "597" },
  { name: "Uruguay", iso2: "UY", iso3: "URY", code: "598" },
  { name: "Caribbean Netherlands", iso2: "BQ", iso3: "BES", code: "599" },
  { name: "Curaçao", iso2: "CW", iso3: "CUW", code: "599 (9)" },

  //Zone 6
  { name: "Malaysia", iso2: "MY", iso3: "MYS", code: "60" },
  { name: "Australia", iso2: "AU", iso3: "AUS", code: "61" },
  {
    name: "Cocos (Keeling) Islands",
    iso2: "CC",
    iso3: "CCK",
    code: "61 (8 9162)"
  },
  { name: "Christmas Island", iso2: "CX", iso3: "CXR", code: "61 (8 9164)" },
  { name: "Indonesia", iso2: "ID", iso3: "IDN", code: "62" },
  { name: "Philippines", iso2: "PH", iso3: "PHL", code: "63" },
  { name: "New Zealand", iso2: "NZ", iso3: "NZL", code: "64" },
  { name: "Pitcairn", iso2: "PN", iso3: "PCN", code: "64" },
  { name: "Singapore", iso2: "SG", iso3: "SGP", code: "65" },
  { name: "Thailand", iso2: "TH", iso3: "THA", code: "66" },
  { name: "Timor-Leste (East Timor)", iso2: "TL", iso3: "TLS", code: "670" },
  { name: "Antarctica", iso2: "AQ", iso3: "ATA", code: "672" },
  {
    name: "Heard Island and McDonald Islands",
    iso2: "HM",
    iso3: "HMD",
    code: "672"
  },
  { name: "Norfolk Island", iso2: "NF", iso3: "NFK", code: "672 (3)" },
  { name: "Brunei", iso2: "BN", iso3: "BRN", code: "673" },
  { name: "Nauru", iso2: "NR", iso3: "NRU", code: "674" },
  { name: "Papua New Guinea", iso2: "PG", iso3: "PNG", code: "675" },
  { name: "Tonga", iso2: "TO", iso3: "TON", code: "676" },
  { name: "Solomon Islands", iso2: "SB", iso3: "SLB", code: "677" },
  { name: "Vanuatu", iso2: "VU", iso3: "VUT", code: "678" },
  { name: "Fiji", iso2: "FJ", iso3: "FJI", code: "679" },
  { name: "Palau", iso2: "PW", iso3: "PLW", code: "680" },
  { name: "Wallis and Futuna", iso2: "WF", iso3: "WLF", code: "681" },
  { name: "Cook Islands", iso2: "CK", iso3: "COK", code: "682" },
  { name: "Niue", iso2: "NU", iso3: "NIU", code: "683" },
  { name: "Samoa", iso2: "WS", iso3: "WSM", code: "685" },
  { name: "Kiribati", iso2: "KI", iso3: "KIR", code: "686" },
  { name: "New Caledonia", iso2: "NC", iso3: "NCL", code: "687" },
  { name: "Tuvalu", iso2: "TV", iso3: "TUV", code: "688" },
  { name: "French Polynesia", iso2: "PF", iso3: "PYF", code: "689" },
  { name: "Tokelau", iso2: "TK", iso3: "TKL", code: "690" },
  { name: "Micronesia", iso2: "FM", iso3: "FSM", code: "691" },
  { name: "Marshall Islands", iso2: "MH", iso3: "MHL", code: "692" },

  // Zone 7
  { name: "Russia", iso2: "RU", iso3: "RUS", code: "7" },
  { name: "Kazakhstan", iso2: "KZ", iso3: "KAZ", code: "7" },

  // Zone 8
  { name: "Japan", iso2: "JP", iso3: "JPN", code: "81" },
  { name: "South Korea", iso2: "KR", iso3: "KOR", code: "82" },
  { name: "Vietnam", iso2: "VN", iso3: "VNM", code: "84" },
  { name: "North Korea", iso2: "KP", iso3: "PRK", code: "850" },
  { name: "Hong Kong", iso2: "HK", iso3: "HKG", code: "852" },
  { name: "Macau", iso2: "MO", iso3: "MAC", code: "853" },
  { name: "Cambodia", iso2: "KH", iso3: "KHM", code: "855" },
  { name: "Laos", iso2: "LA", iso3: "LAO", code: "856" },
  { name: "China", iso2: "CN", iso3: "CHN", code: "86" },
  { name: "Bangladesh", iso2: "BD", iso3: "BGD", code: "880" },
  { name: "Taiwan", iso2: "TW", iso3: "TWN", code: "886" },

  // Zone 9
  { name: "Turkey", iso2: "TR", iso3: "TUR", code: "90" },
  { name: "India", iso2: "IN", iso3: "IND", code: "91" },
  { name: "Pakistan", iso2: "PK", iso3: "PAK", code: "92" },
  { name: "Afghanistan", iso2: "AF", iso3: "AFG", code: "93" },
  { name: "Sri Lanka", iso2: "LK", iso3: "LKA", code: "94" },
  { name: "Myanmar", iso2: "MM", iso3: "MMR", code: "95" },
  { name: "Maldives", iso2: "MV", iso3: "MDV", code: "960" },
  { name: "Lebanon", iso2: "LB", iso3: "LBN", code: "961" },
  { name: "Jordan", iso2: "JO", iso3: "JOR", code: "962" },
  { name: "Syria", iso2: "SY", iso3: "SYR", code: "963" },
  { name: "Iraq", iso2: "IQ", iso3: "IRQ", code: "964" },
  { name: "Kuwait", iso2: "KW", iso3: "KWT", code: "965" },
  { name: "Saudi Arabia", iso2: "SA", iso3: "SAU", code: "966" },
  { name: "Yemen", iso2: "YE", iso3: "YEM", code: "967" },
  { name: "Oman", iso2: "OM", iso3: "OMN", code: "968" },
  { name: "Palestine", iso2: "PS", iso3: "PSE", code: "970" },
  { name: "United Arab Emirates", iso2: "AE", iso3: "ARE", code: "971" },
  { name: "Israel", iso2: "IL", iso3: "ISR", code: "972" },
  { name: "Bahrain", iso2: "BH", iso3: "BHR", code: "973" },
  { name: "Qatar", iso2: "QA", iso3: "QAT", code: "974" },
  { name: "Bhutan", iso2: "BT", iso3: "BTN", code: "975" },
  { name: "Mongolia", iso2: "MN", iso3: "MNG", code: "976" },
  { name: "Nepal", iso2: "NP", iso3: "NPL", code: "977" },
  { name: "Iran", iso2: "IR", iso3: "IRN", code: "98" },
  { name: "Tajikistan", iso2: "TJ", iso3: "TJK", code: "992" },
  { name: "Turkmenistan", iso2: "TM", iso3: "TKM", code: "993" },
  { name: "Azerbaijan", iso2: "AZ", iso3: "AZE", code: "994" },
  { name: "Georgia", iso2: "GE", iso3: "GEO", code: "995" },
  { name: "Kyrgyzstan", iso2: "KG", iso3: "KGZ", code: "996" },
  { name: "Uzbekistan", iso2: "UZ", iso3: "UZB", code: "998" }
].sort((a, b) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "variant" })
);
