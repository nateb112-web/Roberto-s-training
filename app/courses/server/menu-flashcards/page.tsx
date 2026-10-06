"use client";
import Link from "next/link";
import EmployeeNav from "../../../components/EmployeeNav";
import {useEffect,useState} from "react";
const defaultCards=[
["Fried Calamari","Lightly fried calamari and cherry peppers, served with house-made marinara and a fresh lemon wedge."],
["House Nachos","Tri-color tortilla chips, melty cheese blend, pico de gallo, shredded lettuce, fresh jalapeños and sour cream. Add guacamole, adobo chicken, seasoned beef or pulled pork."],
["Roberto's Bone-In Wings","Sauces: buffalo, BBQ, garlic parm, mango habanero, General Tso and hot honey. Dry rubs: blackened, lemon pepper, smoked honey habanero and maple bourbon. Served with celery, carrots and blue cheese or ranch."],
["Quesadilla","Crispy grilled tortilla with Mexican cheese blend, roasted poblano peppers and onions; served with pico de gallo and sour cream. Add adobo chicken, seasoned beef, pulled pork or guacamole."],
["Spinach & Artichoke Dip","Three-cheese blend with spinach and artichokes, served warm with tortilla chips, crispy pita, celery and carrots."],
["Bang Bang Shrimp","Crispy shrimp tossed in a creamy, spicy bang bang sauce."],
["Asian Ribs","Orange-glazed sticky ribs served over house-made slaw."],
["Pan Fried Brussels Sprouts","Crispy Brussels sprouts and local farm bacon, topped with crispy shallots and drizzled with hot honey."],
["Santa Fe Salad","Mixed greens, roasted corn, black beans, pico de gallo, blended cheese, avocado and a warm cheesy tortilla, tossed in chipotle ranch."],
["Cobb Salad","Mixed greens with bacon, avocado, tomatoes, red onion, hard-boiled egg and crumbled blue cheese; choice of dressing."],
["Mediterranean Bowl","Poached farro, feta, black olives, grape tomatoes, cucumber, red onion and dolmas with creamy yogurt dill sauce."],
["Asian Noodle Bowl","Egg noodles with bok choy, red peppers, mushrooms, broccoli and scallions in Thai sauce, finished with sesame seeds and fresh lime. Served hot."],
["The MVP Pizza","Marinara, creamy vodka sauce and a pesto swirl with mozzarella."],
["Tuscan Pepperoni Pizza","Cup & char pepperoni with a hot honey drizzle for a sweet and spicy finish."],
["Roberto Grande Pizza","Sausage, pepperoni, onions, peppers, mushrooms and tomatoes on a loaded classic pizza."],
["Buffalo Chicken Pizza","Pulled buffalo chicken, red onion and crumbled blue cheese, drizzled with house-made ranch."],
["Blackened Chicken Linguine","Blackened chicken breast over linguine with roasted peppers and onions in Cajun cream sauce."],
["Penne Alla Vodka","Penne in creamy tomato vodka sauce, topped with shaved parmesan and charred cherry tomatoes. Add blackened or grilled chicken, grilled shrimp or salmon."],
["Nicola's Classic Parm","Choice of thinly breaded chicken or eggplant, topped with marinara and melted mozzarella, served over linguine."],
["Braised Short Rib","Slow-braised short rib over creamy mashed potatoes with roasted root vegetables and red wine demi-glace."],
["Chicken Marsala","Pan-seared chicken breast in Marsala wine sauce with mushrooms and fresh herbs; mashed potatoes and seasonal vegetables. Can be made cacciatore."],
["Pan Seared Salmon","Sea salt and brown sugar rubbed salmon over parmesan risotto with roasted corn, black beans and charred cherry tomatoes."],
["Fish & Chips","Fresh cod, fried or baked, with fries, house slaw and dill tartar sauce."],
["Bourbon Marinated Steak Tips","10 oz bourbon-marinated steak tips with caramelized onions, truffle parmesan fries and house slaw."],
["Prime NY Strip","14 oz prime New York strip finished with herb butter, served with mashed potatoes and broccolini."],
["Americana Burger","8 oz Black Angus beef, cheddar, lettuce, tomato and pickle on a brioche bun."],
["Sunrise Burger","Fried egg, cheddar, local applewood bacon, lettuce, tomato and chipotle mayo."],
["Buffalo Chicken Wrap","Crispy or grilled buffalo chicken, blue cheese crumbles, lettuce and tomatoes in a flour tortilla; blue cheese dressing on the side."],
["Street Tacos","Corn tortillas with house slaw, cilantro, avocado sauce and chipotle aioli. Choose crispy cod, chicken, carnitas, pulled pork or seasoned beef. Sides are not included."],
["Double Smash Burger","Two 4 oz patties smashed with grilled onions, cheddar, pickles and Roberto's secret sauce on a potato bun. Cooked one temperature: no pink."],
["Roberto's Havanna","Cuban-inspired sandwich with ham, pulled pork, Swiss, pickled onions, sliced pickles, yellow mustard and mayo; pressed on a crispy baguette."],
["Crispy Chicken Sandwich — Two Styles","Nashville Hot: hot honey, house slaw and pickle chips. Americana: lettuce, tomato, pickles and mayo. Both on brioche."],
["Salad Protein Add-Ons","Chicken, flat iron, steak tips, shrimp or salmon can be added to salads and bowls."],
["Pizza Basics","All pizzas are 14 inches. Build Your Own can start as classic or white. Gluten-free is available as an option."],
["Menu Allergy Reminder","Guests should inform their server if anyone in the party has food allergies. Never guess about an allergy—follow the restaurant's allergy procedure."]
];
export default function MenuFlashcards(){const [cards,setCards]=useState<any[]>(defaultCards),[title,setTitle]=useState("Core Menu Flashcards"),[i,setI]=useState(0),[flip,setFlip]=useState(false),[known,setKnown]=useState<number[]>([]),[practice,setPractice]=useState<number[]>([]);
useEffect(()=>{try{const raw=localStorage.getItem("robertos-study-published-1")||localStorage.getItem("robertos-study-editor-1");if(raw){const d=JSON.parse(raw);if(d.cards?.length){setCards(d.cards.map((x:any)=>[x.front,x.back,x.image]));if(d.title)setTitle(d.title)}}}catch{}},[]);
const next=()=>{setFlip(false);setI(v=>(v+1)%cards.length)}, mark=(good:boolean)=>{if(good){setKnown(a=>a.includes(i)?a:[...a,i]);setPractice(a=>a.filter(x=>x!==i))}else{setPractice(a=>a.includes(i)?a:[...a,i]);setKnown(a=>a.filter(x=>x!==i))}next()};
return <div className="learner"><EmployeeNav/><main className="wrap flashwrap"><Link className="backlink" href="/courses/server">‹ Server Training</Link><div className="flashhead"><div><div className="eyebrow">MENU KNOWLEDGE • PRACTICE</div><h1>{title}</h1><p>Tap the card to reveal the answer. Flashcards are practice and do not affect your training score.</p></div><div className="flashcount"><b>{i+1}</b> / {cards.length}</div></div><div className="flashstats"><span><b>{known.length}</b> Got It</span><span><b>{practice.length}</b> Need Practice</span><span><b>{cards.length}</b> Total Cards</span></div><button className={"flashcard restaurantflash "+(flip?"flipped":"")} onClick={()=>setFlip(!flip)}><div className="flashphoto">{cards[i]?.[2]?<img src={cards[i][2]} alt={cards[i][0]}/>:<div className="flashplaceholder"><span>▧</span><small>Product photo</small></div>}</div><div className="flashcopy"><span className="flashlabel">{flip?"DESCRIPTION & DETAILS":"MENU ITEM"}</span><strong>{flip?cards[i]?.[1]:cards[i]?.[0]}</strong><small className="fliphint">{flip?"Tap to return to item":"Tap anywhere on the card to reveal details"}</small></div></button><div className="flashactions"><button className="practicebtn" onClick={()=>mark(false)}>Need Practice</button><button className="outline" onClick={next}>Skip</button><button className="gotitbtn" onClick={()=>mark(true)}>Got It</button></div><div className="flashprogress"><div style={{width:`${((i+1)/cards.length)*100}%`}} /></div><p className="muted flashnote">Practice progress is for self-study only. Quiz and exam results are tracked separately.</p></main></div>}