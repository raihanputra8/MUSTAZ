import { Bike, Product, JournalPost, Profile, Order } from '@/types/database';

export const mockProfile: Profile = {
  id: 'SKL-MBR-0482',
  full_name: 'Raihan Putra',
  email: 'raihan@sakala.cc',
  avatar_url: '/assets/avatar_user.png',
  role: 'artisan',
  created_at: '2024-03-12T00:00:00Z',
};

export const mockBikes: Bike[] = [
  {
    id: 'bike-01',
    title: "'KUJANG GOLD'",
    year: 1978,
    make: 'Honda',
    model: 'CB550 Four',
    description: 'Custom cafe-racer dengan de-tabbed frame, bespoke megaphone exhaust, dan tangki bensin hand-hammered bermotif Kujang.',
    specs: {
      frame: 'De-tabbed Raw Steel',
      exhaust: '4-into-1 Custom Megaphone',
      colorway: 'Sakala Royal Blue & Gold',
      workshop: 'Nikko Garage x Sakala',
      displacement: '550cc Inline-Four',
    },
    image_url: '/assets/bike_cb550.png',
    gallery: [
      '/assets/bike_cb550.png',
      '/assets/culture_workshop.png',
      '/assets/journal_subang.png',
      '/assets/culture_ceremony.png',
      '/assets/culture_members.png',
      '/assets/sakala_emblem.png',
    ],
    status: 'archival',
  },
  {
    id: 'bike-02',
    title: "'NIGHT CRAWLER'",
    year: 1982,
    make: 'Yamaha',
    model: 'XS650',
    description: 'Bobber hardtail minimalis berbasis mesin twin 650cc dengan finishing Grounding Black pekat dan postur rendah.',
    specs: {
      engine: '650cc Twin Rebuilt Stage II',
      chassis: 'Weld-on Rigid Hardtail',
      finish: 'Grounding Black #000000',
      wheels: "19\" Front / 16\" Rear Firestone",
      displacement: '654cc Parallel-Twin',
    },
    image_url: '/assets/bike_xs650.png',
    gallery: [
      '/assets/bike_xs650.png',
      '/assets/culture_workshop.png',
      '/assets/culture_ceremony.png',
      '/assets/journal_subang.png',
      '/assets/culture_members.png',
    ],
    status: 'commissioned',
  },
  {
    id: 'bike-03',
    title: "'THE NOMAD'",
    year: 1994,
    make: 'Harley-Davidson',
    model: 'Sportster 1200',
    description: 'Scrambler tangguh jarak jauh dengan knalpot high-mount kembar, suspensi Ohlins 390mm, dan ban dual-purpose.',
    specs: {
      exhaust: 'Twin High-Mount Scrambler',
      suspension: 'Ohlins Piggyback 390mm',
      rims: 'Forged Lightweight Alloy',
      displacement: '1200cc Evolution V-Twin',
      workshop: 'Sakala Bandung Guild',
    },
    image_url: '/assets/bike_sportster.png',
    gallery: [
      '/assets/bike_sportster.png',
      '/assets/journal_subang.png',
      '/assets/culture_workshop.png',
      '/assets/culture_members.png',
      '/assets/culture_ceremony.png',
    ],
    status: 'private_collection',
  },
];

export const mockProducts: Product[] = [
  {
    id: 'prod-01',
    sku: 'SKL-TEE-01',
    name: 'CIRCLE EMBLEM HEAVYWEIGHT TEE',
    category: 't-shirts',
    price_idr: 385000,
    price_usd: 28,
    stock_status: 'available',
    stock_count: 15,
    description: 'Vintage Royal Navy screenprint with distressed Bandung guild insignia.',
    image_url: '/assets/product_tee.png',
  },
  {
    id: 'prod-02',
    sku: 'SKL-HD-02',
    name: 'GARAGE CREW ZIP HOODIE',
    category: 'hoodies',
    price_idr: 720000,
    price_usd: 52,
    stock_status: 'low_stock',
    stock_count: 4,
    description: '420 GSM French Terry with Grounding Black body and Golden Yellow embroidery.',
    image_url: '/assets/product_hoodie.png',
  },
  {
    id: 'prod-03',
    sku: 'SKL-JKT-03',
    name: 'BROTHERHOOD COACH JACKET',
    category: 'jackets',
    price_idr: 1150000,
    price_usd: 82,
    stock_status: 'available',
    stock_count: 8,
    description: 'Quilted lining with chain-stitched SAKALA cursive chest and back script.',
    image_url: '/assets/product_jacket.png',
  },
  {
    id: 'prod-04',
    sku: 'SKL-CAP-04',
    name: 'LOYALTY TRUCKER CAP',
    category: 'headwear',
    price_idr: 260000,
    price_usd: 19,
    stock_status: 'waitlist',
    stock_count: 0,
    description: 'Direct embroidery, heavy mesh back, and stamped custom brass rear closure.',
    image_url: '/assets/product_cap.png',
  },
];

export const mockJournalPosts: JournalPost[] = [
  {
    id: 'post-01',
    title: 'THE ASCENT OF TANGKUBAN PERAHU AT 03:00 WIB',
    slug: 'the-ascent-of-tangkuban-perahu',
    category: 'EXPEDITION DISPATCH',
    read_time: '14 MIN READ',
    author: 'A. PRATAMA',
    author_role: 'Lead Frame Artisan & SAKALA Road Captain',
    photographer: 'B. KURNIAWAN (35mm Archival Gelatin)',
    publish_date: 'OCTOBER 2026',
    elevation: '2,084 MASL — Kawah Ratu Caldera',
    temperature: '11°C — Heavy Drizzle & Cold Fog',
    coordinates: '6°46\'00"S 107°36\'00"E',
    excerpt: 'When the sulfuric fog descends upon the jagged volcanic backbone of West Java at 03:00 WIB, mechanical sympathy transforms from theory into raw instinct. A minute-by-minute chronicling of nine hand-built motorcycles conquering Lembang and Tangkuban Perahu in torrential monsoon rain.',
    content: `
### 01:30 WIB — THE CIROYOM RENDEZVOUS

The rain had been drumming a steady, hollow cadence on the corrugated zinc roof of the Ciroyom Atelier since sundown. Inside, the scent was of burnt SAE 20W-50 mineral oil, damp leather jackets, and the sharp metallic tang of fresh TIG-brazed chromoly tubing.

Nine machines stood idling in the narrow alleyway off Jalan Jamika. Twin-cylinder parallel engines, a big-bore single 500cc thumper, and two vintage 1974 four-strokes with custom pie-cut open pipes. There were no turn signals. No digital instrument clusters. Just mechanical throttles, hand-turned brass fuel petcocks, and the amber glow of 6-volt halogen headlamps cutting through the exhaust fumes.

"Check the primary drive tensions once more," signaled Pratama through his visor. "Once we hit the switchbacks past Setiabudhi, there is no shoulder to pull over. The road becomes black ice when the volcanic silt washes down from the tea slopes."

Tire pressures were bled down to 18 PSI on the rear Avon Speedmasters to coax every fraction of mechanical bite from the slick mountain asphalt. At 01:45 WIB, nine clutches engaged simultaneously, and the sound echoed like a thunderstorm between the brick walls of Bandung.

### 02:20 WIB — THE LEMBANG CLIMB & THE COLD FRONT

The transition from the Bandung basin to the high mountain air of Lembang is abrupt. Within fifteen kilometers, the ambient temperature plummeted from 23°C to 14°C. Condensation beaded on brass carb velocity stacks, chilling the mixture and requiring small, blind fingers on the pilot air screws at red lights.

As we ascended past the Cikole pine groves, the streetlights vanished entirely. The darkness here is total, broken only by the yellow spears of our headlamps illuminating centuries-old eucalyptus trees standing like sentinels in the mist. 

Driving a rigid frame machine through wet mountain hairpin turns requires an intimate bodily dialogue. Without rear suspension, every pebble, every seam of fresh tarmac, every pothole gouged by vegetable transport trucks is transmitted directly into the rider's pelvis and spine. You do not countersteer with casual ease; you lean your entire upper torso over the aluminum peanut tank, weighting the knurled footpegs, and listen for the subtle scrub of rubber slipping on moss.

> “When the mist swallows your headlight twenty meters ahead, you don't steer with your eyes; you steer with the vibration of the crankcase through your ribs. You become the machine's primary dampener.”

### 03:00 WIB — THE CRATER WALLS (KAWAH RATU SUMMIT)

At 03:00 WIB sharp, our tires ground into the volcanic gravel access road encircling the northern rim of Kawah Ratu. Here, at 2,084 meters above sea level, the air turned dense and choking with sulfur dioxide fumes blowing off the boiling sulfuric lake beneath.

The engines were shut off one by one. The silence that followed was immense, broken only by the rhythmic pinging of rapidly cooling exhaust headers and the faint hiss of volcanic vents venting deep within the earth.

Steam rose in thick white plumes from hot engine fins into the freezing drizzle. Pratama pulled a battered stainless thermos from his canvas roll and poured black Robusta coffee into tin cups. Nobody spoke for ten minutes. In the customs guild, the silence after a punishing ascent is the truest form of prayer.

### THE MECHANICAL MATRIX: 9 RIGID SURVIVORS

The machines that reached the rim without a single sheared bolt or stalled magneto:

1. **Plate 01 — 1974 Yamaha XS650 "Sanghyang Heuleut"** (Hand-formed 2.5mm aluminum monocoque, open Mikuni VM34 carbs, custom Girder front end).
2. **Plate 02 — 1968 Honda CB450 Black Bomber** (Torsion bar valve springs, twin high-rise scrambler pipes, bronze oil cooler).
3. **Plate 03 — 1981 Kawasaki KZ750 Twin** (Hardtail loop, Ceriani 38mm forks, Bates vintage headlamp).
4. **Plate 04 — 1982 Yamaha SR500 Thumper** (High compression piston, magneto ignition, single Bates seat).
5. **Plate 05 — 1978 Suzuki GS750 Four** (Hand-beaten fairing, raw pie-cut 4-into-1 exhaust, Morris mag).

Each machine bore the physical scars of the ride: streaks of white volcanic dust plastered against the crankcases, oil mist on the rear spokes, and chain lube splattered across handmade stainless rear fenders.

### 05:15 WIB — DESCENT INTO THE CIATER TEA EMERALDS

As dawn cracked on the horizon, the sky shifted from bruised violet to pale amber. Below us lay the endless rolling terraces of the Ciater tea plantations, shrouded in sea-foam morning clouds. 

With kickstarters kicked with stiff boots, the nine engines fired to life on the first stroke—warm combustion greeting the cold dawn. We leaned into the downhill sweeping turns towards Subang, throttle cables pulled taut, the roar echoing across the valley like ancient Sundanese brass gongs.
    `,
    gallery: [
      '/assets/journal_subang.png',
      '/assets/culture_riders.png',
      '/assets/culture_workshop.png',
      '/assets/bike_yamaha_xs650.png',
    ],
    cover_image_url: '/assets/journal_subang.png',
    featured: true,
  },
  {
    id: 'post-02',
    title: 'FORGING STEEL IN CIROYOM: INSIDE THE SAKALA ENGINE LAB',
    slug: 'forging-steel-ciroyom-engine-lab',
    category: 'WORKSHOP MONOGRAPH',
    read_time: '8 MIN READ',
    author: 'R. HENDRA',
    author_role: 'Senior Metallurgist & Engine Specialist',
    photographer: 'SAKALA ARCHIVE',
    publish_date: 'SEP 2026',
    elevation: '768 MASL — Bandung Basin',
    temperature: '26°C — Atelier Forge',
    coordinates: '6°55\'12"S 107°35\'20"E',
    excerpt: 'From hand-beaten aluminum tanks to custom bronze bushings, a photographic monograph inside our Bandung workshop.',
    cover_image_url: '/assets/culture_workshop.png',
    featured: false,
  },
  {
    id: 'post-03',
    title: 'THE MEANING OF THE CIRCLE: AN ORAL HISTORY OF THE BANDUNG SCENE',
    slug: 'meaning-of-the-circle-bandung-scene',
    category: 'BROTHERHOOD ARCHIVE',
    read_time: '15 MIN READ',
    author: 'ARCHIVE EDITORS',
    author_role: 'SAKALA Historical Society',
    photographer: 'HISTORICAL PRINTS',
    publish_date: 'SEP 2026',
    elevation: '720 MASL',
    temperature: '24°C',
    coordinates: '6°54\'00"S 107°36\'00"E',
    excerpt: 'Interviews with early custom motorcycle pioneers who shaped West Java\'s distinct mechanical subculture over three decades.',
    cover_image_url: '/assets/culture_ceremony.png',
    featured: false,
  },
];

export const mockOrders: Order[] = [
  {
    id: 'SKL-849201',
    customer_name: 'Raihan Putra',
    customer_email: 'raihan@sakala.cc',
    customer_phone: '+62 812-9842-1029',
    shipping_address: 'Jl. Jamika No. 42, Ciroyom',
    city: 'Bandung',
    postal_code: '40182',
    courier: 'JNE YES (Next Day)',
    payment_method: 'BCA Virtual Account',
    items: [
      {
        product: mockProducts[0],
        quantity: 1,
        size: 'L',
      },
      {
        product: mockProducts[2],
        quantity: 1,
        size: 'OS',
      }
    ],
    subtotal_idr: 1100000,
    shipping_fee_idr: 35000,
    total_idr: 1135000,
    status: 'dispatching',
    created_at: '2026-10-20T14:32:00Z',
  },
  {
    id: 'SKL-719304',
    customer_name: 'Raihan Putra',
    customer_email: 'raihan@sakala.cc',
    customer_phone: '+62 812-9842-1029',
    shipping_address: 'Jl. Jamika No. 42, Ciroyom',
    city: 'Bandung',
    postal_code: '40182',
    courier: 'J&T Cargo Heavy',
    payment_method: 'QRIS Instant Settlement',
    items: [
      {
        product: mockProducts[1],
        quantity: 1,
        size: 'XL',
      }
    ],
    subtotal_idr: 785000,
    shipping_fee_idr: 35000,
    total_idr: 820000,
    status: 'delivered',
    created_at: '2026-09-15T09:12:00Z',
  }
];

