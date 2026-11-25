// Curated demonstration content. These are intentionally short examples, not production-tested recipes.
// Each ingredient ID is stable across languages and can become a database foreign key.
const ingredientRows = [
 ['chicken','Chicken','Pollo'],['rice','Rice','Riso'],['tomato','Tomato','Pomodoro'],['onion','Onion','Cipolla'],
 ['potato','Potato','Patata'],['garlic','Garlic','Aglio'],['olive_oil','Olive oil','Olio d’oliva'],['lemon','Lemon','Limone'],
 ['chickpeas','Chickpeas','Ceci'],['tahini','Tahini','Tahina'],['salt','Salt','Sale'],['pita','Pita bread','Pane pita'],
 ['yogurt','Plain yogurt','Yogurt bianco'],['cucumber','Cucumber','Cetriolo'],['lettuce','Lettuce','Lattuga'],
 ['sumac','Sumac','Sommacco'],['mint','Mint','Menta'],['parsley','Parsley','Prezzemolo'],
 ['bulgur','Bulgur','Bulgur'],['lentils','Lentils','Lenticchie'],['carrot','Carrot','Carota'],
 ['cumin','Cumin','Cumino'],['paprika','Paprika','Paprica'],['chili','Chili pepper','Peperoncino'],
 ['cilantro','Cilantro / coriander leaves','Coriandolo fresco'],['flour','Flour','Farina'],
 ['zaatar','Za’atar','Za’atar'],['yeast','Yeast','Lievito'],['water','Water','Acqua'],
 ['pine_nuts','Pine nuts','Pinoli'],['pasta','Pasta','Pasta'],['basil','Basil','Basilico'],
 ['mushrooms','Mushrooms','Funghi'],['broth','Vegetable broth','Brodo vegetale'],
 ['parmesan','Parmesan','Parmigiano'],['butter','Butter','Burro'],['eggs','Eggs','Uova'],
 ['pepper','Bell pepper','Peperone'],['coconut_milk','Coconut milk','Latte di cocco'],
 ['curry','Curry powder','Curry in polvere'],['peas','Peas','Piselli'],['soy_sauce','Soy sauce','Salsa di soia'],
 ['avocado','Avocado','Avocado'],['lime','Lime','Lime'],['feta','Feta','Feta'],['olives','Olives','Olive'],
 ['tortilla','Tortillas','Tortillas'],['tofu','Tofu','Tofu'],['miso','Miso paste','Pasta di miso'],
 ['seaweed','Wakame seaweed','Alga wakame'],['spring_onion','Spring onion','Cipollotto']
];
export const ingredients = ingredientRows.map(([id,en,it])=>({id,name:{en,it}}));
export const ingredientById=Object.fromEntries(ingredients.map(i=>[i.id,i]));
export const cuisines=[
 {id:'Lebanese',name:{en:'Lebanese',it:'Libanese'},flag:'🇱🇧'},
 {id:'Iranian',name:{en:'Iranian (Persian)',it:'Iraniana (persiana)'},flag:'🇮🇷'},
 {id:'Syrian',name:{en:'Syrian',it:'Siriana'},flag:'🇸🇾'},
 {id:'Palestinian',name:{en:'Palestinian',it:'Palestinese'},flag:'🇵🇸'},
 {id:'Jordanian',name:{en:'Jordanian',it:'Giordana'},flag:'🇯🇴'},
 {id:'Iraqi',name:{en:'Iraqi',it:'Irachena'},flag:'🇮🇶'},
 {id:'Egyptian',name:{en:'Egyptian',it:'Egiziana'},flag:'🇪🇬'},
 {id:'Moroccan',name:{en:'Moroccan',it:'Marocchina'},flag:'🇲🇦'},
 {id:'Tunisian',name:{en:'Tunisian',it:'Tunisina'},flag:'🇹🇳'},
 {id:'Algerian',name:{en:'Algerian',it:'Algerina'},flag:'🇩🇿'},
 {id:'Saudi',name:{en:'Saudi',it:'Saudita'},flag:'🇸🇦'},
 {id:'Yemeni',name:{en:'Yemeni',it:'Yemenita'},flag:'🇾🇪'},
 {id:'Sudanese',name:{en:'Sudanese',it:'Sudanese'},flag:'🇸🇩'},
 {id:'Emirati',name:{en:'Emirati',it:'Emiratina'},flag:'🇦🇪'},
 {id:'Omani',name:{en:'Omani',it:'Omanita'},flag:'🇴🇲'},
 {id:'Bahraini',name:{en:'Bahraini',it:'Bahreinita'},flag:'🇧🇭'},
 {id:'Kuwaiti',name:{en:'Kuwaiti',it:'Kuwaitiana'},flag:'🇰🇼'},
 {id:'Italian',name:{en:'Italian',it:'Italiana'},flag:'🇮🇹'},
 {id:'French',name:{en:'French',it:'Francese'},flag:'🇫🇷'},
 {id:'Spanish',name:{en:'Spanish',it:'Spagnola'},flag:'🇪🇸'},
 {id:'Portuguese',name:{en:'Portuguese',it:'Portoghese'},flag:'🇵🇹'},
 {id:'Greek',name:{en:'Greek',it:'Greca'},flag:'🇬🇷'},
 {id:'German',name:{en:'German',it:'Tedesca'},flag:'🇩🇪'},
 {id:'Austrian',name:{en:'Austrian',it:'Austriaca'},flag:'🇦🇹'},
 {id:'Polish',name:{en:'Polish',it:'Polacca'},flag:'🇵🇱'},
 {id:'Ukrainian',name:{en:'Ukrainian',it:'Ucraina'},flag:'🇺🇦'},
 {id:'Hungarian',name:{en:'Hungarian',it:'Ungherese'},flag:'🇭🇺'},
 {id:'Croatian',name:{en:'Croatian',it:'Croata'},flag:'🇭🇷'},
 {id:'Swedish',name:{en:'Swedish',it:'Svedese'},flag:'🇸🇪'},
 {id:'Irish',name:{en:'Irish',it:'Irlandese'},flag:'🇮🇪'},
 {id:'British',name:{en:'British',it:'Britannica'},flag:'🇬🇧'},
 {id:'Dutch',name:{en:'Dutch',it:'Olandese'},flag:'🇳🇱'},
 {id:'Belgian',name:{en:'Belgian',it:'Belga'},flag:'🇧🇪'},
 {id:'Romanian',name:{en:'Romanian',it:'Romena'},flag:'🇷🇴'},
 {id:'Czech',name:{en:'Czech',it:'Ceca'},flag:'🇨🇿'},
 {id:'Swiss',name:{en:'Swiss',it:'Svizzera'},flag:'🇨🇭'},
 {id:'Danish',name:{en:'Danish',it:'Danese'},flag:'🇩🇰'},
 {id:'Norwegian',name:{en:'Norwegian',it:'Norvegese'},flag:'🇳🇴'},
 {id:'Turkish',name:{en:'Turkish',it:'Turca'},flag:'🇹🇷'},
 {id:'Indian',name:{en:'Indian',it:'Indiana'},flag:'🇮🇳'},
 {id:'Japanese',name:{en:'Japanese',it:'Giapponese'},flag:'🇯🇵'},
 {id:'Mexican',name:{en:'Mexican',it:'Messicana'},flag:'🇲🇽'},
 {id:'Thai',name:{en:'Thai',it:'Thailandese'},flag:'🇹🇭'}
];
const rows = [
 {id:'hummus',title:['Classic hummus','Hummus classico'],cuisine:'Lebanese',emoji:'🫘',theme:'ochre',diet:'vegan',time:15,category:'Mezze',description:['Silky chickpeas blended with tahini, lemon and garlic.','Ceci cremosi frullati con tahina, limone e aglio.'],items:'chickpeas:400:g,tahini:60:g,lemon:1:pcs,garlic:1:pcs,olive_oil:25:ml,salt:1:tsp,water:50:ml',steps:[['Drain the chickpeas, reserving a little liquid.','Scola i ceci e conserva un po’ di liquido.'],['Blend chickpeas, tahini, lemon juice and garlic until smooth. Add water gradually.','Frulla ceci, tahina, succo di limone e aglio fino a ottenere una crema. Aggiungi acqua gradualmente.'],['Season, spread in a bowl and finish with olive oil.','Regola di sale, distribuisci in una ciotola e completa con olio d’oliva.']]},
 {id:'fattoush',title:['Fattoush salad','Insalata fattoush'],cuisine:'Lebanese',emoji:'🥗',theme:'green',diet:'vegan',time:20,category:'Salad',description:['Fresh vegetables, bright lemon and crispy pita.','Verdure fresche, limone e pita croccante.'],items:'tomato:3:pcs,cucumber:1:pcs,lettuce:1:pcs,pita:2:pcs,lemon:1:pcs,olive_oil:40:ml,sumac:2:tsp,mint:10:g',steps:[['Wash and chop the vegetables into bite-sized pieces.','Lava e taglia le verdure a bocconcini.'],['Toast pieces of pita bread until crisp.','Tosta il pane pita a pezzetti finché diventa croccante.'],['Toss the vegetables with lemon, oil, sumac and mint. Add pita immediately before serving.','Condisci le verdure con limone, olio, sommacco e menta. Aggiungi la pita poco prima di servire.']]},
 {id:'batata-harra',title:['Batata harra','Batata harra'],cuisine:'Lebanese',emoji:'🥔',theme:'spice',diet:'vegan',time:40,category:'Mezze',description:['Spiced potatoes with garlic, herbs and lemon.','Patate speziate con aglio, erbe aromatiche e limone.'],items:'potato:700:g,garlic:3:pcs,cilantro:20:g,chili:1:pcs,lemon:1:pcs,olive_oil:45:ml,salt:1:tsp',steps:[['Cut the potatoes into cubes and roast or pan-fry until tender and golden.','Taglia le patate a cubetti e cuocile in forno o in padella fino a doratura.'],['Warm garlic and chili briefly in olive oil, without burning them.','Scalda brevemente aglio e peperoncino nell’olio, senza bruciarli.'],['Toss with potatoes, coriander leaves and lemon juice. Serve warm.','Mescola con patate, coriandolo fresco e succo di limone. Servi caldo.']]},
 {id:'tabbouleh',title:['Tabbouleh','Tabbouleh'],cuisine:'Lebanese',emoji:'🌿',theme:'green',diet:'vegan',time:25,category:'Salad',description:['A bright parsley salad with tomato, mint and a little bulgur.','Insalata fresca di prezzemolo, pomodoro, menta e poco bulgur.'],items:'parsley:160:g,tomato:3:pcs,mint:15:g,bulgur:50:g,lemon:2:pcs,olive_oil:50:ml,salt:1:tsp',steps:[['Prepare the bulgur according to its package instructions and cool.','Prepara il bulgur seguendo la confezione e lascialo raffreddare.'],['Finely chop parsley, mint and tomatoes.','Trita finemente prezzemolo, menta e pomodori.'],['Combine all ingredients and dress with lemon, olive oil and salt.','Mescola tutti gli ingredienti e condisci con limone, olio e sale.']]},
 {id:'lentil-soup',title:['Lebanese lentil soup','Zuppa di lenticchie libanese'],cuisine:'Lebanese',emoji:'🍲',theme:'ochre',diet:'vegan',time:45,category:'Soup',description:['Comforting lentils simmered with vegetables and cumin.','Lenticchie confortanti cotte con verdure e cumino.'],items:'lentils:250:g,onion:1:pcs,carrot:2:pcs,cumin:1:tsp,olive_oil:30:ml,lemon:1:pcs,water:1100:ml',steps:[['Chop onion and carrot; soften them in olive oil.','Trita cipolla e carote e falle appassire nell’olio.'],['Add rinsed lentils, cumin and water; simmer until tender.','Aggiungi lenticchie sciacquate, cumino e acqua; cuoci finché sono morbide.'],['Blend partially if desired and finish with lemon juice.','Frulla parzialmente a piacere e completa con succo di limone.']]},
 {id:'chicken-shawarma',title:['Chicken shawarma bowls','Bowl di shawarma di pollo'],cuisine:'Lebanese',emoji:'🍗',theme:'spice',diet:'none',time:50,category:'Main',description:['Warm, spiced chicken with lemon and garlic.','Pollo speziato e profumato con limone e aglio.'],items:'chicken:600:g,yogurt:120:g,lemon:1:pcs,garlic:3:pcs,cumin:1:tsp,paprika:1:tsp,pita:4:pcs,olive_oil:25:ml',steps:[['Slice chicken and mix with yogurt, lemon, garlic and spices. Marinate chilled.','Taglia il pollo e mescola con yogurt, limone, aglio e spezie. Lascia marinare in frigorifero.'],['Cook chicken thoroughly in a hot pan or oven until safe to eat.','Cuoci completamente il pollo in padella o in forno fino a temperatura sicura.'],['Serve with warmed pita and your choice of vegetables.','Servi con pita calda e verdure a scelta.']]},
 {id:'manakish-zaatar',title:['Za’atar manakish','Manakish allo za’atar'],cuisine:'Lebanese',emoji:'🫓',theme:'gold',diet:'vegan',time:90,category:'Bread',description:['Soft flatbread topped with fragrant za’atar.','Focaccia morbida con za’atar profumato.'],items:'flour:400:g,zaatar:60:g,olive_oil:80:ml,yeast:7:g,water:250:ml,salt:1:tsp',steps:[['Mix flour, yeast, water and salt; knead to a soft dough. Let it rise.','Mescola farina, lievito, acqua e sale; impasta fino a ottenere un composto morbido. Lascia lievitare.'],['Divide, flatten and top with a mixture of za’atar and olive oil.','Dividi l’impasto, stendilo e condisci con za’atar e olio.'],['Bake in a preheated hot oven until cooked and lightly golden.','Cuoci nel forno caldo preriscaldato fino a leggera doratura.']]},
 {id:'fattet-hummus',title:['Fattet hummus','Fattet hummus'],cuisine:'Lebanese',emoji:'🥣',theme:'cream',diet:'vegetarian',time:35,category:'Mezze',description:['Layers of crisp pita, warm chickpeas and tahini yogurt sauce.','Strati di pita croccante, ceci caldi e salsa di yogurt alla tahina.'],items:'chickpeas:400:g,pita:3:pcs,yogurt:350:g,tahini:50:g,garlic:2:pcs,lemon:1:pcs,pine_nuts:25:g',steps:[['Warm the chickpeas and toast pita pieces until crisp.','Scalda i ceci e tosta la pita a pezzetti finché è croccante.'],['Whisk yogurt, tahini, crushed garlic and lemon juice.','Mescola yogurt, tahina, aglio schiacciato e succo di limone.'],['Layer pita, chickpeas and sauce. Top with toasted pine nuts and serve immediately.','Disponi a strati pita, ceci e salsa. Completa con pinoli tostati e servi subito.']]},
 {id:'pasta-pomodoro',title:['Pasta al pomodoro','Pasta al pomodoro'],cuisine:'Italian',emoji:'🍝',theme:'tomato',diet:'vegan',time:25,category:'Main',description:['A simple tomato and basil sauce for everyday pasta.','Un sugo semplice di pomodoro e basilico per la pasta di tutti i giorni.'],items:'pasta:320:g,tomato:500:g,garlic:2:pcs,basil:15:g,olive_oil:35:ml,salt:1:tsp',steps:[['Cook pasta in salted water according to the package.','Cuoci la pasta in acqua salata seguendo la confezione.'],['Gently cook garlic in olive oil; add tomatoes and simmer.','Scalda l’aglio nell’olio; aggiungi i pomodori e fai sobbollire.'],['Combine pasta with the sauce and finish with basil.','Unisci pasta e salsa e completa con basilico.']]},
 {id:'mushroom-risotto',title:['Mushroom risotto','Risotto ai funghi'],cuisine:'Italian',emoji:'🍚',theme:'cream',diet:'vegetarian',time:45,category:'Main',description:['Creamy rice with mushrooms and parmesan.','Riso cremoso con funghi e parmigiano.'],items:'rice:320:g,mushrooms:300:g,onion:1:pcs,broth:1100:ml,parmesan:60:g,butter:40:g',steps:[['Cook sliced mushrooms and onion until softened.','Cuoci funghi a fette e cipolla finché diventano morbidi.'],['Add rice and gradually stir in warm broth until the rice is cooked.','Aggiungi il riso e incorpora gradualmente il brodo caldo, mescolando fino a cottura.'],['Remove from heat and stir in butter and parmesan.','Togli dal fuoco e manteca con burro e parmigiano.']]},
 {id:'shakshuka',title:['Tunisian-style shakshuka','Shakshuka in stile tunisino'],cuisine:'Tunisian',emoji:'🍳',theme:'tomato',diet:'vegetarian',time:35,category:'Breakfast',description:['Eggs gently cooked in fragrant tomato and pepper sauce.','Uova cotte lentamente in salsa profumata di pomodoro e peperoni.'],items:'eggs:4:pcs,tomato:500:g,onion:1:pcs,pepper:1:pcs,cumin:1:tsp,olive_oil:30:ml',steps:[['Cook onion and pepper in olive oil until soft.','Cuoci cipolla e peperone nell’olio finché sono morbidi.'],['Add tomato and cumin; simmer until thickened.','Aggiungi pomodoro e cumino; fai sobbollire fino ad addensare.'],['Make wells, add eggs and cover until eggs reach your preferred safe doneness.','Crea degli incavi, aggiungi le uova e copri fino al grado di cottura desiderato e sicuro.']]},
 {id:'chickpea-curry',title:['Chickpea coconut curry','Curry di ceci e cocco'],cuisine:'Indian',emoji:'🍛',theme:'gold',diet:'vegan',time:35,category:'Main',description:['A warming curry with chickpeas, tomato and coconut milk.','Un curry avvolgente con ceci, pomodoro e latte di cocco.'],items:'chickpeas:450:g,coconut_milk:400:ml,curry:2:tsp,onion:1:pcs,tomato:300:g,rice:280:g',steps:[['Cook onion with curry powder until fragrant.','Cuoci la cipolla con il curry fino a sprigionare il profumo.'],['Add tomato, chickpeas and coconut milk; simmer gently.','Aggiungi pomodoro, ceci e latte di cocco; cuoci a fuoco dolce.'],['Cook rice separately and serve with the curry.','Cuoci il riso a parte e servi con il curry.']]},
 {id:'fried-rice',title:['Vegetable fried rice','Riso saltato con verdure'],cuisine:'Japanese',emoji:'🍚',theme:'green',diet:'vegetarian',time:25,category:'Main',description:['A quick pan of rice, vegetables, egg and soy sauce.','Riso veloce saltato con verdure, uovo e salsa di soia.'],items:'rice:320:g,eggs:2:pcs,carrot:2:pcs,peas:130:g,soy_sauce:35:ml,onion:1:pcs',steps:[['Use safely cooled, refrigerated cooked rice; cook onion and carrot in a hot pan.','Usa riso già cotto e raffreddato correttamente in frigorifero; salta cipolla e carota in padella.'],['Add peas and rice, stirring until thoroughly heated.','Aggiungi piselli e riso, mescolando finché tutto è ben caldo.'],['Scramble eggs separately or in the pan, then add soy sauce and mix.','Cuoci le uova strapazzate a parte o in padella, poi aggiungi la salsa di soia e mescola.']]},
 {id:'guacamole',title:['Guacamole','Guacamole'],cuisine:'Mexican',emoji:'🥑',theme:'green',diet:'vegan',time:15,category:'Mezze',description:['Creamy avocado with lime and fresh herbs.','Avocado cremoso con lime ed erbe fresche.'],items:'avocado:3:pcs,lime:2:pcs,onion:1:pcs,tomato:1:pcs,cilantro:15:g,salt:1:tsp',steps:[['Mash ripe avocado with lime juice.','Schiaccia gli avocado maturi con succo di lime.'],['Finely chop onion, tomato and coriander leaves.','Trita finemente cipolla, pomodoro e coriandolo fresco.'],['Mix together, season and serve promptly.','Mescola tutto, regola di sale e servi subito.']]},
 {id:'greek-salad',title:['Greek salad','Insalata greca'],cuisine:'Greek',emoji:'🥗',theme:'green',diet:'vegetarian',time:15,category:'Salad',description:['Crunchy vegetables with feta, olives and olive oil.','Verdure croccanti con feta, olive e olio d’oliva.'],items:'tomato:3:pcs,cucumber:1:pcs,feta:180:g,olives:100:g,onion:1:pcs,olive_oil:40:ml',steps:[['Cut tomatoes, cucumber and onion.','Taglia pomodori, cetriolo e cipolla.'],['Arrange in a bowl with feta and olives.','Disponi in una ciotola con feta e olive.'],['Dress with olive oil and serve.','Condisci con olio e servi.']]},
 {id:'chicken-fajitas',title:['Chicken fajitas','Fajitas di pollo'],cuisine:'Mexican',emoji:'🌮',theme:'spice',diet:'none',time:35,category:'Main',description:['Sizzling chicken and peppers served with tortillas.','Pollo e peperoni saltati, serviti con tortillas.'],items:'chicken:500:g,pepper:2:pcs,onion:1:pcs,tortilla:8:pcs,lime:1:pcs,cumin:1:tsp,olive_oil:30:ml',steps:[['Slice chicken, peppers and onion into strips.','Taglia pollo, peperoni e cipolla a striscioline.'],['Cook chicken thoroughly, then add vegetables and cumin.','Cuoci completamente il pollo, poi aggiungi verdure e cumino.'],['Serve hot in warm tortillas with lime.','Servi nelle tortillas calde con lime.']]},
 {id:'miso-soup',title:['Simple miso soup','Zuppa di miso semplice'],cuisine:'Japanese',emoji:'🍜',theme:'cream',diet:'vegan',time:20,category:'Soup',description:['Light broth with tofu, miso and wakame.','Brodo leggero con tofu, miso e wakame.'],items:'tofu:250:g,miso:70:g,seaweed:10:g,water:1000:ml,spring_onion:2:pcs',steps:[['Heat water and rehydrate wakame following its package instructions.','Scalda l’acqua e reidrata il wakame seguendo la confezione.'],['Add cubed tofu and warm gently.','Aggiungi il tofu a cubetti e scalda dolcemente.'],['Dissolve miso in a little warm broth off heat and stir in; garnish with spring onion.','Sciogli il miso in poco brodo caldo fuori dal fuoco, mescola e completa con cipollotto.']]},
 {id:'spanish-tortilla',title:['Spanish potato tortilla','Tortilla spagnola di patate'],cuisine:'Spanish',emoji:'🍳',theme:'gold',diet:'vegetarian',time:45,category:'Main',description:['Golden egg omelette with tender potatoes and onion.','Frittata dorata con patate tenere e cipolla.'],items:'eggs:6:pcs,potato:550:g,onion:1:pcs,olive_oil:80:ml,salt:1:tsp',steps:[['Slice potatoes and onion thinly; cook gently until tender.','Affetta finemente patate e cipolla; cuoci dolcemente fino a renderle tenere.'],['Drain and mix with beaten eggs and salt.','Scola e mescola con uova sbattute e sale.'],['Cook in a nonstick pan, turning carefully, until the center is safely cooked.','Cuoci in padella antiaderente, girando con attenzione, finché il centro è ben cotto.']]}
];
export const recipes=rows.map(r=>({
 ...r,
 name:{en:r.title[0],it:r.title[1]},
 description:{en:r.description[0],it:r.description[1]},
 ingredients:r.items.split(',').map(v=>{const [id,qty,unit]=v.split(':');return {id,qty:Number(qty),unit};}),
 steps:r.steps.map(([en,it])=>({en,it}))
}));
export const getRecipe=id=>recipes.find(r=>r.id===id);
export const getCuisine=id=>cuisines.find(c=>c.id===id);
export const normalize=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu,' ');
// Public search aliases only. The canonical ingredient ID remains unchanged in Supabase.
// Never equate different ingredients here: culinary alternatives are suggestions below.
const searchAliases = {
 chicken:['chicken breast','chicken thighs','pollo','petto di pollo'],
 rice:['riso','white rice','brown rice','basmati rice','riso basmati'],
 tomato:['tomatoes','pomodori','pomodoro','fresh tomato','pomodori freschi'],
 onion:['onions','cipolle','yellow onion','red onion','cipolla rossa'],
 potato:['potatoes','patate','patata'],
 garlic:['garlic cloves','aglio','spicchi di aglio','spicchi d aglio'],
 olive_oil:['extra virgin olive oil','evoo','olio evo','olio extravergine di oliva'],
 lemon:['lemons','limoni','limone'],
 lime:['limes','lime'],
 chickpeas:['chickpea','ceci','cece','garbanzo beans','garbanzos'],
 cilantro:['coriander leaves','fresh coriander','cilantro leaves','coriandolo fresco','foglie di coriandolo'],
 parsley:['fresh parsley','prezzemolo fresco','flat leaf parsley'],
 spring_onion:['scallion','scallions','green onion','green onions','spring onions','cipollotti','cipollotto'],
 yogurt:['natural yogurt','plain yoghurt','yoghurt bianco','yogurt naturale'],
 flour:['wheat flour','farina di grano','all purpose flour'],
 pepper:['bell peppers','bell pepper','peperoni','peperone'],
 chili:['chili peppers','chilli','chilli pepper','peperoncini','peperoncino'],
 mushrooms:['mushroom','funghi','fungo'],
 eggs:['egg','uovo','uova'],
 lentils:['lentil','lenticchia','lenticchie'],
 peas:['pea','pisello','piselli'],
 olives:['olive','oliva'],
 tortilla:['tortilla','wrap','wraps'],
 pasta:['spaghetti','penne','maccheroni'],
 basil:['basilico fresco','fresh basil'],
 mint:['menta fresca','fresh mint']
};
export function ingredientMatches(query){
 const value=normalize(query);
 if(!value) return [];
 return ingredients.map(item=>{
  const canonical=[item.name.en,item.name.it,item.id.replaceAll('_',' ')].filter(Boolean).map(normalize);
  const aliases=(searchAliases[item.id]||[]).map(normalize);
  // An actual ingredient's name outranks a generic ingredient's search alias.
  const score=canonical.includes(value)?0:aliases.includes(value)?1:
   canonical.some(t=>t.startsWith(value))?2:aliases.some(t=>t.startsWith(value))?3:
   canonical.some(t=>t.includes(value))?4:aliases.some(t=>t.includes(value))?5:6;
  return {item,score};
 }).filter(x=>x.score!==6).sort((a,b)=>a.score-b.score||a.item.name.en.localeCompare(b.item.name.en))
 .slice(0,8).map(x=>x.item);
}

// Directional, conservative culinary suggestions (NOT exact ingredient matches).
// This list intentionally avoids swaps involving dairy, gluten, nuts or animal protein.
const swapRules = {
 lemon:[{id:'lime',note:{en:'Lime is more aromatic; adjust the amount to taste.',it:'Il lime è più aromatico; regola la quantità a gusto.'}}],
 lime:[{id:'lemon',note:{en:'Lemon changes the citrus flavor; adjust to taste.',it:'Il limone cambia il gusto agrumato; regola a piacere.'}}],
 cilantro:[{id:'parsley',note:{en:'Parsley changes the characteristic flavor of the dish.',it:'Il prezzemolo cambia il sapore caratteristico del piatto.'}}],
 parsley:[{id:'cilantro',note:{en:'Coriander leaves have a distinctive, stronger flavor.',it:'Il coriandolo fresco ha un sapore distinto e più intenso.'}}],
 onion:[{id:'spring_onion',note:{en:'Spring onions are milder; cooking results may differ.',it:'I cipollotti sono più delicati; la cottura può variare.'}}],
 spring_onion:[{id:'onion',note:{en:'Regular onions taste stronger and need different cooking time.',it:'La cipolla comune è più intensa e richiede tempi diversi.'}}]
};
export function substitutionFor(missingId, selected){
 const available=new Set(selected);
 const suggested=(swapRules[missingId]||[]).find(s=>available.has(s.id));
 return suggested?{missingId,availableId:suggested.id,note:suggested.note}:null;
}
// v30.6: verified ingredient families, derived from the v27/v28/v30 vocabulary.
// Matching is about the *food* a visitor has, not substring similarity:
// "rice" must NEVER match rice flour/noodles/vinegar; "chicken" must NEVER
// match chicken stock/liver; and "tomato" must NEVER silently mean paste.
// A generic ingredient matches a specific variety and vice versa. Two
// distinct specific varieties DO NOT match each other.
// Keep this as an explicit allowlist: newly imported ingredients do not gain
// unsafe equivalence from their names alone.
export const ingredientFamilies = {
 chicken:['chicken_breast','chicken_thigh','boneless_chicken_thigh','chicken_drumsticks','chicken_wings','whole_chicken'],
 rice:['basmati_rice','brown_rice','arborio_rice','short_grain_rice','long_grain_rice','jasmine_rice','sella_rice','persian_rice','ankabot_rice'],
 pasta:['spaghetti','penne','orzo_pasta'],
 beef:['ground_beef','beef_shank','beef_chuck','beef_short_ribs','beef_brisket'],
 lamb:['ground_lamb','lamb_shank','lamb_shoulder','lamb_ribs','lamb_neck','lamb_leg'],
 tomato:['cherry_tomatoes','canned_tomatoes','tomato_passata'],
 onion:['red_onion'],
 pepper:['red_pepper'],
 potato:[], // Sweet potato, potato starch and potato noodles are not equivalent.
 garlic:[], // Garlic powder and toum are not identical to fresh cloves.
 lemon:['lemon_juice'], // A fresh lemon can be squeezed; check equivalent quantity.
 chickpeas:['canned_chickpeas'], // Canned vs dried requires different preparation.
 lentils:['green_lentils','red_lentils','black_lentils','brown_lentils','cooked_lentils'],
 kidney_beans:['canned_kidney_beans'],
 white_beans:['canned_white_beans'],
 fava_beans:['cooked_fava_beans','baby_fava_beans','dried_fava_beans'],
 eggplant:['baby_eggplants'],
 zucchini:['mini_zucchini'],
 cucumber:['lebanese_cucumber'],
 mushrooms:['button_mushrooms','wild_mushrooms','portobello','porcini','chanterelles'],
 olives:['green_olives','black_olives'],
 bulgur:['fine_bulgur','coarse_bulgur'],
 peas:['frozen_peas'],
 butter:['salted_butter','unsalted_butter'],
 semolina:['durum_semolina','semolina_fine','semolina_coarse','semolina_flour'],
 sesame_seeds:['white_sesame','black_sesame'],
 cumin:['cumin_seed'],
 carrot:['purple_carrot','yellow_carrot'],
 mint:['persian_mint'],
 basil:['persian_basil']
};
// Not every item in a family is a drop-in replacement. Results label these
// as a variety/preparation match; users must check the ingredient line.
function relatedIngredient(availableId,requiredId){
 return (ingredientFamilies[availableId]||[]).includes(requiredId) ||
        (ingredientFamilies[requiredId]||[]).includes(availableId);
}
// Use a two-stage, one-to-one assignment: exact ID first, then a related
// variety. A single selected ingredient never satisfies multiple recipe lines.
function matchRequired(required,selected){
 const available=new Set(selected),matched=new Set(),familyMatches=[];
 let exactCount=0;
 for(const item of required){
  if(available.has(item.id)){
   matched.add(item.id);available.delete(item.id);exactCount++;
  }
 }
 for(const item of required){
  if(matched.has(item.id))continue;
  const selectedId=[...available].find(id=>relatedIngredient(id,item.id));
  if(selectedId){matched.add(item.id);available.delete(selectedId);familyMatches.push({selectedId,requiredId:item.id});}
 }
 return {missing:required.filter(item=>!matched.has(item.id)),exactCount,familyMatches,matchedSelected:[...selected].filter(id=>!available.has(id))};
}
// Accept a comma/semicolon-separated list in the homepage search field.
// Never invent IDs for unrecognized text; report it to the user instead.
export function resolveIngredientInput(value,alreadySelected=[]){
 const tokens=String(value||'').split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean);
 const additions=[],unknown=[];
 const existing=new Set(alreadySelected||[]);
 for(const term of tokens){
  const candidates=ingredientMatches(term);
  // Repeated typed ingredients are not errors.
  const best=candidates[0];
  if(!best){unknown.push(term);continue;}
  if(!existing.has(best.id)){additions.push(best.id);existing.add(best.id);}
 }
 return {additions,unknown};
}

export function matchRecipes(selected,filters={},collection=recipes){
 const set=new Set(selected||[]), hasIngredients=set.size>0;
 return collection.filter(r=>(!filters.diet||filters.diet==='all'||filters.diet===r.diet||filters.diet==='vegetarian'&&r.diet==='vegan')&&(!filters.cuisine||filters.cuisine==='all'||r.cuisine===filters.cuisine)&&(!filters.maxTime||r.time<=Number(filters.maxTime)))
 .map(recipe=>{
  // Search coverage uses distinct ingredients; two recipe lines with the
  // same ingredient must not require two different pantry selections.
  const required=[...new Map((Array.isArray(recipe.ingredients)?recipe.ingredients:[])
   .filter(i=>i&&typeof i.id==='string').map(i=>[i.id,i])).values()];
  const {missing,exactCount,familyMatches,matchedSelected}=matchRequired(required,set);
  const matchCount=required.length-missing.length;
  const substitutions=missing.map(i=>substitutionFor(i.id,set)).filter(Boolean);
  return {...recipe,missing,matchCount,exactCount,familyMatches,matchedSelected,selectedTotal:set.size,
   matchPercent:required.length?Math.round(100*matchCount/required.length):0,
   totalRequired:required.length,substitutions,categoryScore:hasIngredients?(missing.length===0?0:missing.length<=2?1:2):2};
 })
 // Zero matches are irrelevant to ingredient search, even when other recipes
 // are available. Empty selection keeps the normal browsing experience.
 .filter(recipe=>!hasIngredients||recipe.matchCount>0)
 .sort((a,b)=>hasIngredients?
   (b.matchCount-a.matchCount||b.matchPercent-a.matchPercent||b.exactCount-a.exactCount||a.missing.length-b.missing.length||a.time-b.time||String(a.name?.en||a.id).localeCompare(String(b.name?.en||b.id))):
   String(a.name?.en||a.id).localeCompare(String(b.name?.en||b.id)));
}
