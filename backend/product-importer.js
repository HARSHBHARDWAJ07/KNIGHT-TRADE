import bcrypt from 'bcrypt';

export async function importProducts(PG, saltRounds) {
  try {
   
    const csvData = `"id","product_name","product_description","product_price","product_image","user_username","product_email"
"8","Bike","Stylish and fuel-efficient commuter bike, driven 18,000 km. Regularly serviced and in excellent condition. Ideal for daily office or college use. Lightweight and easy to handle with strong pickup. New battery installed recently. Insurance valid. Selling due to upgrade. Immediate transfer available. Price slightly negotiable for serious buyers.","1300.00","bike1.jpeg","harsh","harshbhar836@gmail.com"
"9","Bike","Powerful sports bike with aggressive looks and smooth engine performance. Clocked only 12,000 km. Excellent pick-up, disc brakes, digital meter, and tubeless tyres. Maintained like new, no accidents. Used sparingly and kept covered. Great for long rides and city cruising. Selling for financial reasons. Test ride available.","1260.00","bike2.jpeg","harsh","harshbhar836@gmail.com"
"10","Bike","Perfect bike for city rides with 60 km/l mileage. Well-maintained and scratch-free, single owner, used for daily commuting. 35,000 km driven, excellent braking and suspension. Comfortable seating for two. Battery and tyres in good condition. RC and insurance papers available. Priced to sell quickly. No mechanical issues.","1228.00","bike3.jpeg","harsh","harshbhar836@gmail.com"
"11","Bike","Heavy-duty bike with strong road grip and balanced handling. Used 20,000 km, engine in top condition. Great for both city and highway rides. Comfortable seating and stable ride quality. Recently changed tyres and brake pads. Selling due to moving abroad. Clean documents and timely serviced.","1100.00","bike4.jpeg","harsh","harshbhar836@gmail.com"
"12","Bike","Reliable and low-maintenance two-wheeler ideal for students and working professionals. Driven 25,000 km. Excellent mileage, smooth ride, and responsive brakes. Service records available. Paint still shines like new. Battery replaced recently. All documents ready. Selling as a spare vehicle. Great value at this price point.","1115.00","bike5.jpeg","harsh","harshbhar836@gmail.com"
"13","Bike","Lightweight daily-use bike with great handling and pickup. Odometer at 22,000 km. Digital console, smooth clutch, and no mechanical faults. Regularly washed and kept under shade. Great for mileage-conscious buyers. Clean title and proper service history. Selling due to less usage. Priced attractively for a quick sale.","1500.00","bike6.jpeg","harsh","harshbhar836@gmail.com"
"14","Bike","Sporty and compact design, perfect for traffic and tight parking spots. 16,500 km on the odometer. Clean engine sound and efficient fuel consumption. Comfortable seat and strong headlamp. No accidents or major repairs. Ideal for first-time buyers. Price negotiable slightly. Available for test ride anytime.","1450.00","bike7.jpeg","harsh","harshbhar836@gmail.com"
"15","Car","Well-maintained sedan with smooth engine and premium interiors. Driven 45,000 km. AC, power windows, and touchscreen infotainment system work perfectly. Single owner, non-accidental, and regularly serviced. New tyres and battery installed. Perfect for family use. Insurance valid. Documents clear. Selling due to upgrade. Price slightly negotiable.","2000.00","car1.jpeg","harsh","harshbhar836@gmail.com"
"16","car","Compact hatchback ideal for city driving and parking. Excellent mileage and low maintenance cost. Driven 32,000 km with complete service history. Chilling AC, clean cabin, and scratch-free exterior. Used sparingly, non-smoker vehicle. Immediate transfer available. All papers ready. Test drive available for serious buyers.","2100.00","car2.jpeg","harsh","harshbhar836@gmail.com"
"17","car","Spacious SUV with powerful engine and smooth transmission. Only 58,000 km used. Leather seats, automatic climate control, and reverse camera included. No accidents, well-kept body. Perfect for long drives or rough terrain. Insurance and pollution certificate valid. Selling due to relocation. Slight negotiation possible for genuine buyers.","2100.00","car3.jpeg","harsh","harshbhar836@gmail.com"
"18","car","Family-friendly MPV with ample boot space and comfortable seating. Smooth ride quality and strong AC. Used 60,000 km, no major repairs. New tyres and recently serviced. Interior well-kept, no stains or damage. Great for daily use and highway trips. Clear ownership papers. Contact for quick deal.","2200.00","car4.jpeg","harsh","harshbhar836@gmail.com"
"19","car","Stylish compact car with excellent fuel efficiency. Only 28,000 km driven, with full service record. Scratchless body, responsive steering, and effective brakes. Features include Bluetooth, central locking, and airbags. Ideal for beginners or students. Owner selling for upgrade. Insurance active. Test drive available with prior appointment.","2300.00","car5.jpeg","harsh","harshbhar836@gmail.com"
"20","car","Robust diesel car with great pickup and highway mileage. Driven 75,000 km, engine in excellent condition. Comfortable ride, strong suspension, and clear interiors. Single owner, timely serviced at authorized center. Insurance and RC up-to-date. Reason for selling: moving overseas. Clean and reliable option for long-term use.","2300.00","car6.jpeg","harsh","harshbhar836@gmail.com"
"21","car","Sporty look with premium features like alloy wheels, fog lamps, and touchscreen. Used 39,000 km with excellent engine performance. AC, steering, and clutch work like new. Freshly detailed interior. Documents complete. Zero accident history. Great deal for someone looking for a stylish and efficient vehicle at budget price.","2300.00","car7.jpeg","harsh","harshbhar836@gmail.com"
"22","Cycle","Lightweight, single-speed cycle perfect for daily commuting or casual rides. Frame is rust-free and tyres have strong grip. Brakes and chain recently serviced. Smooth pedaling with adjustable seat height. Used rarely, kept indoors. Ideal for students or fitness enthusiasts. Selling due to upgrade. Price slightly negotiable.","500.00","cycle1.jpeg","harsh","harshbhar836@gmail.com"
"23","cycle","Well-maintained geared cycle with front suspension. Offers smooth gear shifting and comfortable rides on rough roads. Used for less than a year. Tyres and brakes in excellent condition. Frame has no dents or rust. Great for fitness or trail riding. Immediate sale, all parts functional and clean.","450.00","cycle2.jpeg","harsh","harshbhar836@gmail.com"
"24","cycle","Sturdy mountain cycle with strong build and dual disc brakes. Ideal for off-road use or city exploration. Tires are barely worn and seat is comfortable. Used only a few times for weekend rides. Selling due to relocation. Looks new, ready to ride. Good deal for adventure lovers.","420.00","cycle3.jpeg","harsh","harshbhar836@gmail.com"
"25","cycle","Hybrid cycle offering the best of road and mountain cycling. Lightweight frame, smooth gears, and ergonomic handlebars. Regularly maintained and stored indoors. Great for long-distance cycling or commuting. Scratch-free body and new saddle. Selling as it's no longer being used. Perfect condition, ready for immediate use.","390.00","cycle4.jpeg","harsh","harshbhar836@gmail.com"
"26","cycle","Kids’ cycle in excellent condition with height-adjustable seat and support wheels. Bright color, no damage, and child-friendly design. Lightly used and stored safely. Brakes are responsive and tyres have good grip. Selling as the child has outgrown it. Ideal for children aged 4 to 7.","280.00","cycle5.jpeg","harsh","harshbhar836@gmail.com"
"27","cycle","Foldable cycle with compact design, perfect for travelers and city dwellers. Easy to store and transport. Used for only a few months. Tyres, brakes, and gears in top condition. Selling due to lack of use. Comfortable ride and eye-catching design. Great value for money.","500.00","cycle6.jpeg","harsh","harshbhar836@gmail.com"
"28","cycle","Durable steel-frame cycle with high ground clearance and puncture-resistant tyres. Excellent for rough roads or village trails. Non-geared, minimal maintenance, and highly reliable. Seat padding recently upgraded. Paint is intact with minor signs of use. Selling to make space at home. Test ride available.","490.00","cycle7.jpeg","harsh","harshbhar836@gmail.com"
"29","F-35 Lightning II","For sale: F-35 Lightning II, 5th-gen multirole stealth fighter. Features advanced AESA radar, sensor fusion, and VTOL (F-35B). Built for versatility—air-to-air, ground strike, electronic warfare, and intelligence missions. Lightning-fast supersonic speeds and stealth profile make it unmatched in contested airspace. Ideal for collectors, defense contractors, or airshow stunners. Low flight hours, pristine condition. Includes advanced avionics, helmet-mounted display, and software upgrades. NATO-interoperable and combat-proven. Secure, high-end transfer only. Price negotiable for serious buyers.","1000000.00","F-35.jpeg","harsh","harshbhar836@gmail.com"
"30","F-22 Raptor","Own the sky with the F-22 Raptor—America’s premier air superiority fighter. With unmatched stealth, agility, and speed (Mach 2.25) . Powered by twin Pratt & Whitney F119 engines with thrust vectoring. Features supercruise, advanced radar, and infrared sensors for precision strikes. Perfect for collectors or simulation use. Decommissioned model; no active armament. Low radar signature, high prestige. Rare availability. Serious inquiries only—international buyers .","12000000.00","F-22.jpeg","harsh","harshbhar836@gmail.com"
"31","SR-71 Blackbird","Legendary SR-71 Blackbird for collectors and museums. Once the world’s fastest manned aircraft (Mach 3.3+), this reconnaissance marvel flew above 85,000 ft. Titanium body, iconic stealth shape. Retired from service, this piece represents Cold War ingenuity and aviation excellence. Includes cockpit instrumentation and detailed maintenance records. Non-flyable, ideal for display. Limited edition, unmatched history. Ideal for aerospace museums or collectors of rare military tech. Transportation and security protocols apply. Own a Cold War icon.","12300000.00","SR-71.jpeg","harsh","harshbhar836@gmail.com"
"32","F/A-18 Hornet","Versatile F/A-18 Hornet, carrier-capable multirole fighter with proven combat record. Twin-engine design, Mach 1.8 top speed, and precision weapon systems. Perfect for both air-to-air combat and ground strikes. Designed for rugged naval use with tailhook and reinforced landing gear. Includes radar, avionics suite, and twin-seat option (F/A-18D). Maintained to NATO specs, decommissioned but intact. Excellent for movie props, training, or private collectors. Seller provides logistics and shipping. Secure deal, documents ready. Message for price.","590000.00","A-29C_Super_Tucano.jpeg","harsh","harshbhar836@gmail.com"
"33","F/A-18 Hornet","Versatile F/A-18 Hornet, carrier-capable multirole fighter with proven combat record. Twin-engine design, Mach 1.8 top speed, and precision weapon systems. Perfect for both air-to-air combat and ground strikes. Designed for rugged naval use with tailhook and reinforced landing gear. Includes radar, avionics suite, and twin-seat option (F/A-18D). Maintained to NATO specs, decommissioned but intact. Excellent for movie props, training, or private collectors. Seller provides logistics and shipping. Secure deal, documents ready. Message for price.","980000.00","F18.jpg","harsh","harshbhar836@gmail.com"
"34","B-2 Spirit Stealth Bomber","Stealth icon for sale: the B-2 Spirit. Flying wing design, radar-evading stealth capabilities, and intercontinental range. Used for strategic bombing and nuclear deterrence. Powered by 4 General Electric engines, fly-by-wire flight control. This decommissioned replica (non-operational) is ideal for museums or defense exhibitions. Authentic exterior, high-detail cockpit, full history. Rare chance to own a piece of Cold War history. Enormous presence, perfect centerpiece. Limited availability. Transportation must meet secure standards. Message to discuss purchase terms.","9900000.00","B-2A_Spirit.jpeg","harsh","harshbhar836@gmail.com"
"35","B-1B Lancer","Rockwell B-1B Lancer for display or static use. Known as “The Bone,” this variable-sweep wing bomber is a supersonic marvel with long-range and massive payload capacity. Four turbofan engines, Mach 1.2 speed, low radar cross-section. Used extensively in U.S. Air Force strategic operations. This decommissioned unit features full cockpit setup, preserved airframe, and documentation. Ideal for museums, educational institutions, or historical installations. Includes secure delivery options. Only one available. Pricing upon inquiry. Not for flight use.","800000.00","B-1B_Lancer.jpeg","harsh","harshbhar836@gmail.com"
"36","Sukhoi Su-27 Flanker","Su-27 Flanker available—twin-engine, air superiority fighter with legendary maneuverability. Mach 2.35 top speed, 30,000 kg thrust. Includes IRST, helmet-sight system, and digital avionics. Combat veteran, used in various air forces. Export model, de-armed and preserved. Sleek Soviet design, can be restored for demo flights or static display. Available for serious buyers, documentation provided. Ideal for aviation fans, airshows, or private collections. High-speed legend. Message for delivery and price logistics.","6700000.00","Sukhoi_Su-27.jpg","harsh","harshbhar836@gmail.com"
"37","Sukhoi Su-30","Sukhoi Su-30 for sale—advanced multirole fighter with thrust-vectoring engines and two-seat cockpit. Known for supermaneuverability, long-range strike capability, and precision target acquisition. Twin AL-31FP engines, modern radar and avionics. Former service aircraft, stored in preserved condition. Ideal for collectors, training programs, or display use. Can be shipped globally with proper documentation. Airframe includes upgrades and maintenance logs. Russian engineering masterpiece available now. Contact to discuss inspection and pricing details.","708000.00","Sukhoi_Su-30.jpeg","harsh","harshbhar836@gmail.com"
"38","Sukhoi Su-34 Fullback","Su-34 Fullback tactical bomber with fighter DNA. Unique side-by-side cockpit, armored canopy, and long-range radar. Specialized for deep strike missions, precision bombing, and electronic warfare. Twin Saturn engines, Mach 1.8 speed. Features terrain-following radar and satellite comms. Decommissioned for display use—includes cockpit systems and service history. Perfect for static shows, defense tech exhibitions, or collectors. Only a few in the civilian circuit. Shipping options available. Pricing and transfer require secure negotiation.","500000.00","Sukhoi_Su-34.jpeg","harsh","harshbhar836@gmail.com"
"39","Sukhoi Su-35S","Su-35S for sale—elite air superiority fighter, an evolution of the Su-27. Thrust-vectoring nozzles, AESA radar, digital fly-by-wire controls. Flawless in dogfights, built for modern air warfare. Twin AL-41F1S engines with supercruise capability. Advanced electronic warfare suite. Recently retired from service, this airframe includes full systems minus weaponry. Near-operational state, ideal for high-end simulators, training, or collection. Comes with ground support kit. Serious offers only. International transfer subject to approval. Enquire for full dossier.","470700.00","Sukhoi_Su-35.jpeg","harsh","harshbhar836@gmail.com"
"40","Sukhoi Su-57 Felon","Next-gen Russian stealth fighter Su-57 Felon now available. Designed for supremacy in air combat, stealth ops, and electronic warfare. Twin-engine, internal weapon bays, radar-absorbing materials. High agility via thrust vectoring, AI-assisted avionics, and 360° sensor coverage. This is a non-operational mock-up or training unit for display only. Cutting-edge design and rare to obtain. Ideal for aerospace events, collectors, or museums. Authentic build, full exterior detailing. Logistics, legal clearances, and delivery negotiable. Message for acquisition process.","6500000.00","Sukhoi_Su-57.jpeg","harsh","harshbhar836@gmail.com"
"41","House","Elegant 3BHK apartment located in the heart of the city with spacious rooms, modern kitchen, and a scenic balcony view. Society features 24/7 security, gym, and parking. Close proximity to metro, malls, and schools makes it perfect for families seeking comfort, convenience, and a premium lifestyle.","100000.00","property1.jpg","harsh","harshbhar836@gmail.com"
"42","House","Well-maintained 2BHK independent house with ample natural light and ventilation. Includes modular kitchen, private parking, and a small backyard garden. Situated in a peaceful residential neighborhood with nearby markets, hospitals, and schools. Ideal for small families or working professionals looking for a cozy, affordable, and convenient living space.","250000.00","property2.jpg","harsh","harshbhar836@gmail.com"
"43","House","Budget-friendly 1BHK flat perfect for students and bachelors. Comes semi-furnished with essential fittings, kitchen cabinets, and geyser. Located near educational institutions, eateries, and public transport. Safe locality with 24-hour water and electricity. Ideal for individuals looking for simple, low-maintenance accommodation in the city.","3200000.00","property3.jpeg","harsh","harshbhar836@gmail.com"
"44","House","Brand new 4BHK duplex villa with premium fittings, large windows, and two balconies. Includes dedicated parking and landscaped front lawn. Located in a gated community with clubhouse, kids’ play area, and jogging track. Best suited for families desiring space, luxury, and a serene environment close to city facilities.","420000.00","property4.jpg","harsh","harshbhar836@gmail.com"
"45","House","Luxurious 5BHK villa with private garden, rooftop lounge, and elegant interior design. Equipped with solar panels, modular kitchen, and high-end security system. Located in a prime gated community with swimming pool, gym, and banquet hall. A dream home for those seeking style, comfort, and modern sustainable living.","300000.00","property6.jpg","harsh","harshbhar836@gmail.com"
"46","House","Spacious 2BHK house with newly tiled flooring, renovated kitchen, and ample parking space. Located in a family-friendly colony with parks and temples nearby. Ideal for middle-income families seeking affordability and comfort. Public transportation, schools, and local markets are easily accessible within walking distance.","410000.00","property7.jpg","harsh","harshbhar836@gmail.com"
"47","House","Smart 3BHK apartment featuring home automation, LED lighting, and designer false ceiling. Fully modular kitchen with chimney and wardrobes in all bedrooms. Situated in a tech-savvy society with CCTV surveillance, power backup, and elevator. Ideal for young families or IT professionals looking for modern lifestyle amenities.","1300000.00","property9.jpg","harsh","harshbhar836@gmail.com"
"48","House","Eco-conscious 2BHK home featuring rainwater harvesting, solar lighting, and an organic garden. Built with sustainable materials and open design for natural ventilation. Perfect for nature lovers seeking a greener lifestyle. Located in a peaceful suburb with easy access to essential services and public transport.","160000.00","property10.jpg","harsh","harshbhar836@gmail.com"
"49","House","Modern 3BHK penthouse with panoramic city view, large terrace, and spacious interiors. Includes smart kitchen, high-speed internet connectivity, and two-car parking. Located in a well-developed area with hospitals, schools, and shopping complexes nearby. Ideal for professionals and families looking for premium urban living.","243000.00","property11.jpg","harsh","harshbhar836@gmail.com"
"50","House","Vintage-style 2BHK home with wooden finishes, antique doors, and cozy interiors. Recently renovated to retain charm while adding modern comfort. Includes front porch, backyard, and covered parking. Located in a heritage neighborhood known for its quiet atmosphere and community spirit. Perfect for retirees or those seeking character-filled homes.","370000.00","property13.jpeg","harsh","harshbhar836@gmail.com"
"51","Laptop","Sleek, powerful laptop ideal for professionals and students. Features a fast processor, crisp full HD display, and long-lasting battery. Perfect for multitasking, online classes, or office work. Lightweight and portable with all essential ports. Recently serviced and in excellent condition. Ready for immediate use.","5000.00","Laptop1.jpeg","harsh","harshbhar836@gmail.com"
"52","Laptop","High-performance laptop with stunning display, great for gaming, designing, and heavy software tasks. Equipped with ample RAM and SSD storage for super-fast operations. Has a robust cooling system and backlit keyboard. Very well maintained with no scratches or dents. Comes with original charger and free laptop sleeve.","5500.00","Laptop2.jpeg","harsh","harshbhar836@gmail.com"
"53","Laptop","Compact laptop with excellent battery life, ideal for travel and everyday use. Runs smoothly with an updated OS, responsive touchpad, and a vivid anti-glare screen. Light signs of use but works perfectly. Great for browsing, movies, and office apps. Affordable and reliable choice for budget-conscious buyers.","6000.00","Laptop3.jpeg","harsh","harshbhar836@gmail.com"
"54","Laptop","Stylish and modern laptop with sharp display and smooth performance. Ideal for work-from-home setups, streaming, and everyday computing. Good sound quality, webcam, and WiFi connectivity. Freshly formatted and ready for use. Light weight makes it easy to carry. Comes with charger and soft case.","5200.00","Laptop4.jpeg","harsh","harshbhar836@gmail.com"
"55","Cooler","Beat the heat with this high-performance cooler. With powerful air delivery and large water tank capacity, it's ideal for medium to large rooms. Low power consumption and castor wheels make it both efficient and portable. Perfect for home or office use. Well-maintained and ready to use.","600.00","cooler1.jpeg","harsh","harshbhar836@gmail.com"
"56","cooler","This air cooler ensures quick cooling with its honeycomb pads and turbo fan technology. Easily movable with its sturdy wheels, it fits perfectly in any corner. Energy-efficient and less noisy, it’s a smart solution to your summer woes. Lightly used and in excellent working condition.","640.00","cooler2.jpeg","harsh","harshbhar836@gmail.com"
"57","cooler","Compact yet powerful air cooler for instant relief from the summer heat. Sleek design fits modern interiors. With adjustable fan speed and swing mode, enjoy uniform cooling throughout the space. Easy to clean and operate. Great value for money and lightly used.","570.00","cooler3.jpeg","harsh","harshbhar836@gmail.com"
"58","cooler","Stay cool all summer with this spacious air cooler featuring a large water tank, strong air throw, and three-speed control. Ideal for bedrooms or small halls. Durable build with smooth wheels for easy mobility. In very good condition with no repairs needed.","690.00","cooleer4.jpeg","harsh","harshbhar836@gmail.com"
"59","cooler","Efficient and quiet cooler perfect for everyday home use. Features include automatic louvres, water level indicator, and eco-friendly operation. Provides strong airflow and keeps your environment fresh. Light usage, no damage, and works like new. A reliable companion during hot days.","700.00","cooler5.jpeg","harsh","harshbhar836@gmail.com"
"60","Guitar","Beautiful acoustic guitar in excellent condition. Perfect for beginners and intermediate players. Delivers rich, warm sound with smooth fretboard action. Hardly used and well-maintained. Includes carry case and extra strings. Great for home practice, jamming, or gigs. A fantastic deal for music lovers.","300.00","guitar1.jpg","harsh","harshbhar836@gmail.com"
"61","Guitar","Classic 6-string guitar with vibrant tone and polished wood finish. Minimal signs of use, fully functional with great sound projection. Comfortable neck and precise tuning pegs. Ideal for both casual play and serious learning. Comes with picks and a soft cover. Ready to play.","340.00","guitar2.jpg","harsh","harshbhar836@gmail.com"
"62","Guitar","High-quality acoustic guitar offering deep bass and bright treble tones. Durable wood body and well-aligned frets ensure a pleasant playing experience. Recently tuned, barely used. Comes with strap and cleaning cloth. A great value for anyone looking to start or grow their musical journey.","290.00","guitar3.jpg","harsh","harshbhar836@gmail.com"
"63","football","Durable football in excellent condition. Ideal for both practice and matches on grass or turf. Maintains air pressure well and shows minimal signs of wear. Great grip and consistent bounce. Lightly used, no punctures. Perfect for school games or weekend play.","100.00","football1.jpg","harsh","harshbhar836@gmail.com"
"64","football","Standard-size football with textured surface for better control and precision. Used for a few friendly matches, still in great shape. Seams are intact, and no air leakage. Suitable for daily practice or local tournaments. Easy to clean and reliable in all weather conditions.","120.00","football2.jpg","harsh","harshbhar836@gmail.com"
"65","football","Hardly used football, great for beginners and casual players. Synthetic outer layer with high durability and soft touch. Ideal for learning dribbles and passes. No damage or defects. Holds shape well. Selling because it’s no longer needed.","110.00","football3.jpg","harsh","harshbhar836@gmail.com"
"66","football","Premium quality football with excellent flight control and grip. Used only indoors for practice. Maintains inflation perfectly. Outer cover is intact without scuffs or tears. Perfect for training sessions, school teams, or weekend play. Looks new and performs reliably.","70.00","football4.jpg","harsh","harshbhar836@gmail.com"
"67","football","Well-maintained football suitable for both kids and adults. Soft surface for safer play and improved control. No punctures, scratches, or wear. Used only a few times. Includes air valve cover. Great for garden or park games.","60.00","football5.jpg","harsh","harshbhar836@gmail.com"
"68","Lamp","Elegant table lamp in excellent condition with a soft ambient glow perfect for bedrooms or study areas. Features a sturdy base, warm light bulb, and sleek modern design. Energy-efficient and easy to maintain. Works flawlessly with any standard plug. A great addition to any decor style.","20.00","lamp1.jpg","harsh","harshbhar836@gmail.com"
"69","Lamp","Stylish floor lamp with adjustable neck and firm stand. Ideal for reading corners or home offices. Offers bright yet soft lighting that creates a cozy environment. Compatible with LED bulbs. Lightly used, well-maintained, and fully functional. Adds both utility and aesthetic charm to any room.","30.00","lamp2.jpeg","harsh","harshbhar836@gmail.com"
"70","Lamp","Classic bedside lamp with a fabric shade and polished finish. Emits a soothing warm glow, ideal for nighttime reading or subtle room lighting. Compact and space-saving design fits all types of nightstands. In perfect working condition with no scratches or dents. Clean and ready to use.","50.00","lamp3.jpg","harsh","harshbhar836@gmail.com"
"71","Lamp","Classic bedside lamp with a fabric shade and polished finish. Emits a soothing warm glow, ideal for nighttime reading or subtle room lighting. Compact and space-saving design fits all types of nightstands. In perfect working condition with no scratches or dents. Clean and ready to use.","40.00","lamp4.jpg","harsh","harshbhar836@gmail.com"
"72","Lamp","Minimalist desk lamp with flexible arm and USB charging support. Provides focused lighting for work or study tasks. Sleek matte body with touch-sensitive controls. Durable, stylish, and energy-saving. Perfect for students, professionals, or home use. Fully functional and gently used, available at an affordable price.","60.00","lamp5.jpg","harsh","harshbhar836@gmail.com"
"73","Mouse","Smooth and responsive USB mouse with ergonomic design for comfortable daily use. Works perfectly for browsing, office work, and gaming. Plug-and-play with no installation needed. Lightly used and in excellent condition. Suitable for desktops and laptops. Reliable and durable with accurate tracking.","10.00","mouse1.jpg","harsh","harshbhar836@gmail.com"
"74","Mouse","Wireless mouse with fast connectivity and long battery life. Sleek design fits perfectly in hand, making it ideal for both work and casual use. Features silent clicks and adjustable DPI. Very little usage, no wear or damage. Comes with USB receiver.","20.00","mouse3.jpg","harsh","harshbhar836@gmail.com"
"75","Mouse","High-precision optical mouse offering smooth tracking and stable performance. Compact and lightweight, great for on-the-go users. Sturdy build with responsive buttons. Wired connection ensures zero lag. Fully functional and barely used. Great value for students or professionals.","25.00","mouse2.jpg","harsh","harshbhar836@gmail.com"
"76","Mouse","Rechargeable Bluetooth mouse with slim body and modern look. Ideal for minimal desk setups. Offers multiple connectivity modes and adjustable sensitivity. Used occasionally, works like new. Excellent for tablets, laptops, and PCs. A clean and efficient tool for everyday tasks.","30.00","mouse5.jpg","harsh","harshbhar836@gmail.com"
"77","Mouse","Basic wired mouse in top working condition. Simple design, perfect for everyday computer use. Scroll wheel and buttons function smoothly. Gently used, no scratches or defects. Compatible with all major operating systems. An affordable and reliable accessory for any setup.","57.00","mouse4.jpg","harsh","harshbhar836@gmail.com"`;

    // Create the user if not exists
    await PG.query(`
      INSERT INTO userdata (email, username, password, address, profile_photo)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING`,
      [
        'harshbhar836@gmail.com',
        'harsh',
        await bcrypt.hash('dummyPassword', saltRounds),
        'Dummy address for imported products',
        'default.jpg'
      ]
    );

    const lines = csvData.split('\n').slice(1); // Skip header
    for (const line of lines) {
      if (!line.trim()) continue;

      const columns = [];
      let current = '';
      let inQuotes = false;
      let escapeNext = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (escapeNext) {
          current += char;
          escapeNext = false;
          continue;
        }

        if (char === '\\') {
          escapeNext = true;
          continue;
        }

        if (char === '"') {
          inQuotes = !inQuotes;
          continue;
        }

        if (char === ',' && !inQuotes) {
          columns.push(current);
          current = '';
          continue;
        }

        current += char;
      }
      columns.push(current);

      const [
        id,
        product_name,
        product_description,
        product_price,
        product_image,
        user_username,
        product_email
      ] = columns;

      // Insert product
      await PG.query(`
        INSERT INTO products (
          id,
          product_name,
          product_description,
          product_price,
          product_image,
          user_username,
          product_email
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING`,
        [
          parseInt(id),
          product_name,
          product_description,
          parseFloat(product_price),
          product_image,
          user_username,
          product_email
        ]
      );
    }

    return { success: true, message: 'Products imported successfully' };
  } catch (error) {
    console.error('Error importing products:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}
