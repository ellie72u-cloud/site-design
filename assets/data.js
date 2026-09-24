"use strict";

/* ===========================================================
   KARGOS — reference data

   Ports, terminals and LOCODEs are real reference facts.
   Companies, vessels, rotations, cut-offs and rates are
   invented for this prototype and labelled as such throughout
   the interface.

   PICT is deliberately absent: its concession expired in June
   2023 and KGTL took over the premises.
   =========================================================== */

const PORTS = [
  ["PKKHI","Karachi","Pakistan",24.85,66.99,"Pakistan",["KICT","SAPT","KGTL"],["khi","karachi port","kpt","keamari"]],
  ["PKBQM","Port Qasim","Pakistan",24.79,67.34,"Pakistan",["QICT"],["qasim","bin qasim","pqa","bqm"]],
  ["PKGWD","Gwadar","Pakistan",25.12,62.32,"Pakistan",["GPT"],["gwadar port","gwd"]],
  ["AEJEA","Jebel Ali","UAE",25.01,55.06,"Gulf",null,["dubai","jebel","uae","jea"]],
  ["QAHMD","Hamad","Qatar",25.03,51.60,"Gulf",null,["doha","qatar","hamad port"]],
  ["IQUQR","Umm Qasr","Iraq",30.03,47.93,"Gulf",null,["basra","basrah","iraq"]],
  ["OMSLL","Salalah","Oman",16.94,54.00,"Gulf",null,["oman","sll"]],
  ["INMUN","Mundra","India",22.84,69.72,"Indian Ocean",null,["india","kutch"]],
  ["SAJED","Jeddah","Saudi Arabia",21.48,39.19,"Red Sea",null,["jiddah","ksa","saudi","jed"]],
  ["EGPSD","Port Said","Egypt",31.26,32.30,"Red Sea",null,["egypt","suez","said"]],
  ["TRMER","Mersin","Turkey",36.80,34.63,"Red Sea",null,["turkey","turkiye"]],
  ["LKCMB","Colombo","Sri Lanka",6.93,79.84,"Indian Ocean",null,["sri lanka","cmb","lanka"]],
  ["BDCGP","Chittagong","Bangladesh",22.31,91.80,"Indian Ocean",null,["chattogram","ctg","bangladesh"]],
  ["SGSIN","Singapore","Singapore",1.26,103.83,"Far East",null,["sin","spore"]],
  ["MYPKG","Port Klang","Malaysia",3.00,101.39,"Far East",null,["klang","malaysia"]],
  ["CNNGB","Ningbo","China",29.87,121.55,"Far East",null,["ningbo zhoushan","ngb"]],
  ["CNSHA","Shanghai","China",31.23,121.47,"Far East",null,["sha","yangshan"]],
  ["NLRTM","Rotterdam","Netherlands",51.92,4.48,"Europe",null,["rtm","holland","netherlands"]],
  ["DEHAM","Hamburg","Germany",53.55,9.99,"Europe",null,["germany","ham"]],
  ["GBFXT","Felixstowe","United Kingdom",51.96,1.35,"Europe",null,["uk","england","britain","fxt"]],
  ["KEMBA","Mombasa","Kenya",-4.04,39.67,"E. Africa",null,["kenya","mba"]],
  ["USNYC","New York","United States",40.70,-74.01,"US East",null,["nyc","newark","new jersey"]],
  ["USHOU","Houston","United States",29.76,-95.37,"US East",null,["texas","hou"]],
  ["UZTAS","Tashkent","Uzbekistan",41.30,69.24,"Central Asia",null,["uzbekistan","toshkent","tas"]],
  ["KZALA","Almaty","Kazakhstan",43.24,76.89,"Central Asia",null,["kazakhstan","alma ata"]]
].map(function (r) {
  return { code: r[0], name: r[1], country: r[2], lat: r[3], lon: r[4], region: r[5], terms: r[6], aliases: r[7] };
});

const PORT = {};
PORTS.forEach(function (p) { PORT[p.code] = p; });

/* The three Pakistani load ports every search starts from. */
const PK = ["PKKHI", "PKBQM", "PKGWD"];

const REGIONS = ["Gulf", "Indian Ocean", "Red Sea", "Far East", "E. Africa", "Europe", "US East", "Central Asia"];

/* wd: weekday of the first call. cut: days before ETD the box closes. */
const SERVICES = [
  { id:"GFX", name:"Gulf Express", op:"GL", wd:5, cut:2, cutH:"18:00", term:"KICT", mode:"sea",
    cargo:["Dry","Reefer","DG"], vessels:["Northern Meridian","Indus Meridian","Indus Crest"], vb:212, br:"W",
    rot:[["PKKHI",0],["AEJEA",4],["QAHMD",6],["IQUQR",9]] },
  { id:"AJS", name:"Jebel Ali Shuttle", op:"AR", wd:2, cut:2, cutH:"17:00", term:"SAPT", mode:"sea",
    cargo:["Dry","Reefer"], vessels:["Arabian Crest","Arabian Pearl"], vb:126, br:"W",
    rot:[["PKKHI",0],["AEJEA",5]] },
  { id:"CFD", name:"Colombo Feeder", op:"MF", wd:1, cut:2, cutH:"18:00", term:"KGTL", mode:"sea",
    cargo:["Dry","Reefer"], vessels:["Indus Harbour","Indus Tide"], vb:88, br:"E",
    rot:[["PKKHI",0],["LKCMB",4],["BDCGP",9]] },
  { id:"RSL", name:"Red Sea Link", op:"OE", wd:0, cut:2, cutH:"16:00", term:"QICT", mode:"sea",
    cargo:["Dry","OOG","DG"], vessels:["Gulf Horizon","Arabian Star","Sea Falcon"], vb:116, br:"E",
    rot:[["PKBQM",0],["OMSLL",4],["SAJED",9],["EGPSD",13],["TRMER",17]] },
  { id:"GLP", name:"Gulf Loop", op:"AR", wd:2, cut:2, cutH:"12:00", term:"KGTL", mode:"sea",
    cargo:["Dry","OOG"], vessels:["Sea Falcon","Desert Wind"], vb:29, br:"E",
    rot:[["PKKHI",0],["INMUN",2],["AEJEA",6]] },
  { id:"CHD", name:"China Direct", op:"OE", wd:1, cut:3, cutH:"16:00", term:"QICT", mode:"sea",
    cargo:["Dry","Reefer"], vessels:["Gulf Falcon","Makran Bay"], vb:54, br:"E",
    rot:[["PKBQM",0],["CNNGB",16],["CNSHA",18]] },
  { id:"FEP", name:"Far East Pendulum", op:"GL", wd:3, cut:3, cutH:"17:00", term:"SAPT", mode:"sea",
    cargo:["Dry","Reefer","DG"], vessels:["Karakoram Star","Hunza Crest","Kirthar Bay"], vb:75, br:"W",
    rot:[["PKKHI",0],["LKCMB",5],["SGSIN",10],["MYPKG",11],["CNNGB",17],["CNSHA",19]] },
  { id:"AFE", name:"Africa East", op:"MF", wd:5, cut:2, cutH:"17:00", term:"KGTL", mode:"sea",
    cargo:["Dry"], vessels:["Clifton Dawn","Manora Light"], vb:41, br:"S",
    rot:[["PKKHI",0],["OMSLL",4],["KEMBA",11]] },
  { id:"EUD", name:"Europe Direct", op:"OE", wd:4, cut:3, cutH:"16:00", term:"QICT", mode:"sea",
    cargo:["Dry","Reefer","OOG"], vessels:["Qasim Voyager","Indus Valley","Sindh Spirit"], vb:302, br:"W",
    rot:[["PKBQM",0],["OMSLL",4],["EGPSD",11],["NLRTM",21],["DEHAM",23],["GBFXT",25]] },
  { id:"TAT", name:"Transatlantic", op:"OE", wd:6, cut:3, cutH:"16:00", term:"QICT", mode:"sea",
    cargo:["Dry","OOG"], vessels:["Atlantic Qasim","Ravi Express"], vb:18, br:"W",
    rot:[["PKBQM",0],["EGPSD",12],["USNYC",28],["USHOU",33]] },
  { id:"GGL", name:"Gwadar Gulf", op:"MF", wd:6, cut:2, cutH:"14:00", term:"GPT", mode:"sea",
    cargo:["Dry","DG"], vessels:["Gwadar Link","Makran Coast"], vb:63, br:"W",
    rot:[["PKGWD",0],["AEJEA",3],["QAHMD",5]] },
  { id:"CIS", name:"CIS Overland", op:"PX", wd:1, cut:2, cutH:"12:00", term:"GPT", mode:"road",
    cargo:["Dry","OOG"], vessels:["TIR convoy"], vb:140, br:"N",
    rot:[["PKGWD",0],["UZTAS",9],["KZALA",13]] },
  { id:"TIR", name:"Karachi to Tashkent TIR", op:"PX", wd:3, cut:2, cutH:"12:00", term:"SAPT", mode:"road",
    cargo:["Dry"], vessels:["TIR convoy"], vb:220, br:"N",
    rot:[["PKKHI",0],["UZTAS",11]] }
];

const SVC = {};
SERVICES.forEach(function (s) { SVC[s.id] = s; });

/* tone: the bar colour on a provider panel, four shades of the brand. */
const FIRMS = [
  { id:"GL", name:"Gulfstar Lines", type:"Shipping line", pitch:"Weekly direct reefer and dry to the Gulf",
    cargo:["Dry","Reefer","DG"], svcs:["GFX","FEP"], verified:true, featured:true, tone:0,
    since:2009, boxes:"4,200 TEU", offices:["Karachi","Dubai"],
    about:"A regional operator running two weekly strings out of Karachi, one into the upper Gulf and one east to the Far East." },
  { id:"AR", name:"Arabian Routes", type:"Shipping line", pitch:"Five-day direct shuttle to Jebel Ali out of SAPT",
    cargo:["Dry","Reefer","OOG"], svcs:["AJS","GLP"], verified:true, featured:false, tone:2,
    since:2014, boxes:"1,800 TEU", offices:["Karachi","Sharjah"],
    about:"Built around one fast shuttle: SAPT to Jebel Ali in five days, with a slower Mundra loop behind it." },
  { id:"OE", name:"Oceanic Express", type:"Shipping line", pitch:"Red Sea, Europe, China and US East from QICT",
    cargo:["Dry","Reefer","OOG"], svcs:["RSL","CHD","EUD","TAT"], verified:true, featured:false, tone:1,
    since:1998, boxes:"11,500 TEU", offices:["Port Qasim","Jeddah","Rotterdam"],
    about:"The long-haul carrier on this coast: four strings, all loading at QICT, reaching Europe and the US East Coast." },
  { id:"MF", name:"Meridian Feeder", type:"Shipping line", pitch:"Feeders linking Karachi and Gwadar to the Oman hubs",
    cargo:["Dry","Reefer","DG"], svcs:["CFD","AFE","GGL"], verified:true, featured:false, tone:3,
    since:2011, boxes:"2,400 TEU", offices:["Karachi","Gwadar","Salalah"],
    about:"Feeder tonnage into Salalah and Colombo, plus the only weekly string calling Gwadar." },
  { id:"IB", name:"Indus Bridge Logistics", type:"NVOCC", pitch:"Own-equipment reefer and dry on Gulf lanes",
    cargo:["Dry","Reefer","DG"], svcs:["GFX","RSL","AJS","GLP"], verified:true, featured:false, tone:1,
    since:2016, boxes:"Own 900 TEU", offices:["Karachi"],
    about:"Buys slots across four services and ships on its own boxes, so equipment is available at short notice." },
  { id:"CM", name:"Crescent Marine Cargo", type:"NVOCC", pitch:"Cold-chain specialist for fruit and seafood",
    cargo:["Dry","Reefer","DG"], svcs:["GFX","FEP","CFD","GLP","AJS"], verified:true, featured:true, tone:1,
    since:2007, boxes:"Own 640 reefer", offices:["Karachi","Lahore"],
    about:"Reefer first: pre-trip inspection at the terminal, genset hire for inland moves and DG handling alongside." },
  { id:"SL", name:"Sea Link Consolidators", type:"NVOCC", pitch:"LCL groupage every Friday to the Gulf and East Africa",
    cargo:["Dry","LCL","Reefer"], svcs:["GFX","AFE","GGL","AJS"], verified:false, featured:false, tone:2,
    since:2019, boxes:"LCL only", offices:["Karachi"],
    about:"A groupage house: one weekly consolidation to the Gulf and a second to Mombasa." },
  { id:"PX", name:"Pak Express Carriers", type:"NVOCC", pitch:"Project and out-of-gauge cargo, plus TIR to Central Asia",
    cargo:["Dry","OOG"], svcs:["CIS","TIR","RSL","TAT"], verified:false, featured:false, tone:3,
    since:2012, boxes:"Flatrack fleet", offices:["Karachi","Quetta","Tashkent"],
    about:"Heavy lift and out-of-gauge, by sea where it fits and by TIR road convoy where it does not." },
  { id:"BL", name:"Bayline Freight", type:"Forwarder", pitch:"Door delivery into Central Asia with customs handled",
    cargo:["Dry","OOG"], svcs:["CIS","TIR","GGL","RSL"], verified:false, featured:false, tone:0,
    since:2015, boxes:"n/a", offices:["Karachi","Tashkent"],
    about:"Door-to-door into Uzbekistan and Kazakhstan, arranging transit paperwork on both sides of the border." },
  { id:"SF", name:"Saddar Forwarding", type:"Forwarder", pitch:"Documentation and inland haulage for exporters",
    cargo:["Dry","Reefer","LCL"], svcs:["EUD","FEP","CHD","GFX"], verified:true, featured:false, tone:1,
    since:2004, boxes:"n/a", offices:["Karachi","Faisalabad","Sialkot"],
    about:"Works the textile corridor: upcountry collection, filing and booking onto the long-haul strings." },
  { id:"KC", name:"Keamari Customs Services", type:"Customs agent", pitch:"WeBOC filing and examination cover at KICT and SAPT",
    cargo:["Dry","Reefer","DG"], svcs:["GFX","AJS","FEP"], verified:true, featured:false, tone:2,
    since:2001, boxes:"n/a", offices:["Karachi"],
    about:"Clearing agent on the Keamari side, attending examination and handling refunds and rebates." },
  { id:"QA", name:"Qasim Clearing Agency", type:"Customs agent", pitch:"Clearance at Port Qasim, DG and bonded a speciality",
    cargo:["Dry","DG","OOG"], svcs:["RSL","CHD","EUD","TAT"], verified:false, featured:false, tone:3,
    since:2010, boxes:"n/a", offices:["Port Qasim"],
    about:"Port Qasim only, with dangerous goods declarations and bonded warehouse movements in house." }
];

const FIRM = {};
FIRMS.forEach(function (f) { FIRM[f.id] = f; });

/* The four brand shades the provider panels are barred with. */
const TONES = ["#0b2545", "#16375e", "#1f4e89", "#0e2a4a"];

const TYPES = [
  { key: "all", label: "All", match: null },
  { key: "line", label: "Lines", match: "Shipping line" },
  { key: "nvocc", label: "NVOCCs", match: "NVOCC" },
  { key: "fwd", label: "Forwarders", match: "Forwarder" },
  { key: "cust", label: "Customs", match: "Customs agent" }
];

const TERMINALS = ["KICT", "SAPT", "KGTL", "QICT", "GPT"];
const CARGOS = ["Dry", "Reefer", "DG", "OOG", "LCL"];
