// AddictionSolitaire
// Conception: Alexandre Duchesneau et Rémi Langevin

/*
DESCRIPTION DU PROGRAMME
*/

var actTab = [];             // Tableau sur lequel nous allons faire les manipulations
var nameCard = [];           // Tableau contenant tout les noms des cartes du jeu (sans les jokers)
var tryMax = 3;				 // Chance maximale pour brasser
var tryRemain = 0;           // Variable qui va compter le nombre d'essai pour brasser
var winTab = [[],[],[],[]];  // Un sous-tableau pour chaque couleur (4)
var empBad = 0;

function init()         
{  // Fonction qui initialise une grille de jeu
	actTab = [];                            
	tryRemain = tryMax + 1;  // Un de plus parce que lorsque qu'on shuffle, on diminue le nombre de chance d'un fois
	
	var b = document.getElementById("b");   // Ecrit le squelette (du body) du HTML
	b.innerHTML = "\
	<table>\
		<tr id = \"row0\">\
		</tr>\
		<tr id = \"row1\">\
		</tr>\
		<tr id = \"row2\">\
		</tr>\
		<tr id = \"row3\">\
		</tr>\
	</table>\
	<span id = \"span1\"></span><br>\
	<button type =\"button\" onclick=\"init()\"> Nouvelle partie </button>";

	tellMeTruth(); 		// Initialise un tableau ordonne
	shuffle(actTab);  	// Le melange
}

function tellMeTruth ()								
{  // Met chaque cartes (nom) de meme valeur dans un tableau cote a cote et en ordre croissant (nameCard). De plus, on leur attribue un id dans le tableau actTab.

	var vals = ['empty',2,3,4,5,6,7,8,9,10,'J','Q','K'];  // J:JACKS, Q:QUEENS, K:KINGS
	var couleurs = ['H','D','C','S'];                     // H:HEARTS, D:DIAMONDS, C:CLUBS, S:SPADES
	var i = 0;

    vals.forEach(function(x)
	{
		couleurs.forEach(function(y)
		{	
			if (x == 'empty') 
			{
				nameCard.push(x + '');  // Tableau contenant leur nom ex: '2H'
				actTab.push(i);         // Tableau contenant les id de chaque carte (c'est aussi les index 
				  						// de chaque carte dans le tableau namecard)
				
			} else 
			{
				nameCard.push(x + y + '');
				// On concat la valeur de la carte a sa couleur pour le path servant a aller chercher son image
				actTab.push(i);	
			}

			i++;
		});
	});
}

function shuffle (tab)
{  // Fonction qui melange le jeu de carte en memorisant les cartes bien place et diminue le nombre d'essai pour brasser
    if(tryRemain == 4 )  // Utile lors d'un appel de init(). Aucune carte a memorise, juste besoin de melange
    {
    	var randTab = randomize(tab);      // Melange toutes les cartes

		actTab = randTab.slice();          // Copie dans la variable globale

		var rowTab = tabIn4Row(randTab);   // Transforme en [[], [], [], []] pour Ãªtre compatible avec findPlayable()
    }
    else  // Si nous ne sommes pas dans un appel provenant de init()
    {
    	var rowTab = getGoodOnes(tab);  // Memorise dans un tableau les cartes deja bien place
    	var randTab = randomize(tab);   // Melange le reste	
        
		for (var i = 0; i < rowTab.length; i++)
		{
            if (rowTab[i].length <= 13)
            {
                rowTab[i] = rowTab[i].concat(randTab.splice(0, 13 - rowTab[i].length));
                // Concat les cartes memorise avec une partie de celles melangees
            }            
		}

		actTab = [];

		rowTab.forEach(function(x)   // Copie le nouveau tableau (memorise "+" random) dans la variable globale actTab
		{
			x.forEach(function(y)
			{
				actTab.push(y);	
			});
		});
    }
    
    writeHTML(rowTab);          // Ecrit le HTML
    findPlayable(rowTab);		// Trouve les nouvelles cartes jouables 
    tryRemain -= 1;  // On enleve une chance
    
    var span = document.getElementById("span");
		
    if (tryRemain <= 0)
	{ // Si toute les essais sont Ã©puise, on change le HTML pour informer le joueur	 
		span1.innerHTML = "<br> Vous ne pouvez plus brasser les cartes <br>";
	}
    else if (empBad == 4 && tryRemain > 0)
    {
	noChButton ();		
    }
    else if (empBad == 4)
    {
	span1.innerHTML = "<br> Fin de la partie! <br>";
    }
    else
    {  // On change le HTML pour informer le joueur de combien d'essai il dispose pour brasser ainsi que le bouton pour le faire
	span1.innerHTML = "<br> Vous pouvez encore <button type =\"button\" onclick=\"shuffle(actTab)\"> Brasser les cartes </button> " + tryRemain + " fois <br>";
    }

	winOrLose();	// On verifie si le joueur a gagner, perdu ou s'il continue de jouer
}

function noChButton ()
{  // Ecrit le HTML pour le boutton brasser les cartes si c'est la seule option possible
	var span = document.getElementById("span");
	
	span1.innerHTML = "<br> Vous devez <button type =\"button\" onclick=\"shuffle(actTab)\"> Brasser les cartes </button> <br>";
}

function getGoodOnes (tab)
{  // Met dans un tableau les suites de cartes deja bien place
	var streakTab = [];         // Contient le nombre de cartes bien place de chaque suite
	var rowTab = [[],[],[],[]]; // Contient les cartes bien place
	var offset = 0;

	rowTab.forEach(function(x, i)
	{ // Trouve le nombre de carte bien place de chaque rangee
		streakTab.push(inARow(tab, i, 0, 0, 1, "any"));
	});
	
	streakTab.forEach(function(x, i)
	{  // Va prendre la suite de cartes bien place dans chaque rangee et les mettres dans un tableau
		rowTab[i] =	tab.splice(i * 13 - offset, x);
		offset += x; 
		// l'operation splice modifie le tableau "tab", alors on s'assure que le debut de chaque 
		// rangee est modifie en consequence du nombre de cartes enleve
   	});

	return rowTab;
}

function inARow(tab, row, col, streak, id, color)
{  //verifie combien de cartes sont a leur place dans la rangee en cours d'analyse
	var index = col + row * 13;
	//calcule l'index qui represente le debut de la rangee en cours d'analyse a la premiere recursion et incremente a chaque fois

	if(tab[index] >> 2 == id && col < 13) //verifie si dans la colonne actuelle on retrouve la carte supposee etre la
	{  
		if(color == "any")  //vrai a la premiere recursion pour chaque rangee
		{
			color = tab[index] % 4;  //on determine la couleur de la rangee 
            return inARow(tab, row, col+1, streak+1, id+1, color);  // on refait l'analyse pour la colonne suivante
		}
		else if (tab[index] % 4 == color)  //on verifie si la couleur de la carte correspond a celle de la rangee (determinee par le "2" debutant la rangee)
		{
			return inARow(tab, row, col+1, streak+1, id+1, color);  // on refait l'analyse pour la colonne suivant
		}
		else  //si on a pas la bonne couleur, on retourne la valeur correspondant au nombre de cartes correctement placees pour cette rangee
		{
			return streak; 
		}
	}
	else  //meme chose que precedent, mais si la valeur de la carte ne correspond pas dans la suite
	{
		return streak;
	}
}

function randomize (tab)
{ // Melange chaque elements d'un tableaux
    var randTab = [];
    
    while(tab.length > 0)
    {
        var random = Math.floor( ( tab.length * Math.random() ) ); // Choisi un element aleatoire du tableau
        var carteChoisi = tab.splice(random, 1);				   // et le rajoute au tableau melange
        
        randTab.push(carteChoisi[0]);
    }
    return randTab;
}

function writeHTML (tab) 
{ // Ecrit le path correspondant a chaque carte au bon endroit dans le HTML
	tab.forEach(function(x,i)
	{
		var row = document.getElementById("row" + i); // Trouve la bonne rangee
		row.innerHTML = "";							  // Efface ce qu'il y avait avant
		x.forEach(function(y)
		{	
			row.innerHTML += "<td id=\"" + y + "\"> <img src=\"cards/" + nameCard[y] + ".svg\"> </td>" + "\n";
			// Pour chaque carte, ecrit le path pour l'image de la carte
		});
	});
}

function findPlayable (tab)
{ // Trouve les cartes qui peuvent permuter avec les empty et met le background en couleur "lime"
	var emptySpace = findEmpty(tab); // Trouvons les empty en question
	emptySpace.reverse(); // Si une carte 2 peut bouger dans plusieurs rangees (dans la 1er colonne bien sur),  
						  // nous voulons qu'il soit permuter dans la premiere rangee disponible
	emptySpace.forEach(function(x)
	{	
		if(x.col == 0) 
		{  // Si un empty dans la premiere colonne, alors tous les 2 peuvent y aller
			for (var value = 4; value <= 7; value++) // 4 a 7 sont les valeurs attibuer aux cartes 2
			{  
				document.getElementById(value).style.backgroundColor = "lime";
				document.getElementById(value).onclick = function() 
				{
					var id = this.id;
					permute(id, tab[x.row][x.col]);
					// depart: la valeur associe a la carte 2, arrive: la valeur associe a la carte empty
				};
			}
		}
		else
		{
			var value = tab[x.row][x.col - 1] + 4 + "";
			// On va chercher la valeur associe de la carte place avant la carte empty
			// et on additionne 4 pour trouver la valeur associe a la carte suivante de meme couleur
			// exemple: JH.value + 4 = QH.value
			document.getElementById(value).style.backgroundColor = "lime";
			document.getElementById(value).onclick = function() 
			{
				var id = this.id;
				permute(id, tab[x.row][x.col]);
			};
		}
	});
}

function findEmpty (tab)
{ // Trouve les cartes empty et note la position dans un tableau
	var emptySpace = [];
	empBad = 0;   // Si increment jusqu'a 4, alors nous ne pouvons plus permuter de carte
				  // utile pour determiner un perdant
	tab.forEach(function (x,i)
	{
		x.forEach(function(y,j)
		{
			if (y >> 2 == 0)  // Si nous avons une carte empty
			{  // Si la carte est dans la 1er colonne OU devant une carte autre qu'un King ou un empty
				if (j == 0 || ( x[j-1] <= 47 && x[j-1] > 3))
				{
					emptySpace.push({row: i, col: j}); // Sinon c'est une position convoite

				} else if ( x[j-1] > 47 || x[j-1] < 4)
				{  // Si par contre, la carte devant la empty trouver est un King ou une autre empty
					empBad++;  // Nous la notons car dans winOrLose() on veut savoir 
				}			   // si nous pouvons encore jouer
			}
		});
	});
	return emptySpace;
}

function permute(depart, end)
{ // Change deux elements de place dans un tableau
	var d = 0;    // Va devenir l'index de la carte de depart
    var a = 0;    // Va devenir l'index de la carte d'arrive   
    
    actTab.forEach(function(x, i)
	{ // On cherche la position des cartes a permuter dans le tableau
        
        if(x == depart){
            d = i;    
        } else if(x == end){
            a = i;   
        }
    });
    
    if(a < d){     // Petit ajustement pour les splice ci-dessous 
        var t = d; // On place l'arrive aprÃ¨s le depart 
        d = a;
        a = t;
    }
    
    var tab1 = actTab.splice(0, d);  // Enleve tout avant la carte de depart
    var tab2 = actTab.splice(0, 1);  // Isole la carte de depart
    var tab3 = actTab.splice(0, a - d - 1); // on enleve la longueur des tableaux deja enleve
    var tab4 = actTab.splice(0, 1);  // Isole la carte d'arrive
    var tab5 = actTab.splice(0, actTab.length); // Enleve le reste
    
    // On concatene chaque tableau precedant en inversant la position des deux cartes voulu 
    						   
    tab2 = tab2.concat(tab5);  // L'ordre d'avant:
    tab3 = tab3.concat(tab2);  // [tab1, tab2, tab3, tab4, tab5]
    tab4 = tab4.concat(tab3);  // L'ordre que nous creons:
    tab1 = tab1.concat(tab4);  // [tab1, tab4, tab3, tab2, tab5]
    actTab = tab1;
    
	var rowTab = tabIn4Row(actTab);  // On ramene le tableau en 4 sous-tableau pour findPlayable()

    writeHTML(rowTab);    // On change les cartes de place dans le HTML
    findPlayable(rowTab); // Quelles sont les nouvelles cartes jouables
    
    if (empBad == 4 && tmpRemain !=0) // Si nous ne pouvons plus jouer de carte, on change le bouton
    {
	noChButton ();		
    }    
    winOrLose();          // Gagnant, perdant ou joueur
}

function tabIn4Row (tab)
{ // Retourne un tableau avec 4 sous-tableaux
	
    var copie = tab.slice(); // Copie pour ne pas changer le tableau entre dans la fonction
    var resultat = [];
    
    for(var i = 0; i < 4; i++) {
        
        resultat.push(copie.splice(0, 13));  // Sous-tableaux de 13 elements
        
    }
    
    return resultat;
}

function winOrLose ()
{ // Determine si nous avons un gagnant, un perdant ou le jeu continu
	var isWinner = 0;

	for (var i = 0; i < 4; i++)
	{
		isWinner += inARow(actTab, i, 0, 0, 1, "any"); 
		// Verifie si nous avons bien 4 rangees avec 12 cartes ordonnees du 2 au K
		if (isWinner < 12 * (i + 1))		 // Si nous n'avons pas de suite ordonne dans une 
		{									 // rangee, nous n'avons pas de gagnant
			break;
		}
	}

	var span = document.getElementById("span");

	if(isWinner == 48) // Si 4 rangee de 12 cartes ordonnes du 2 au K, alors gagnant
	{
		span.innerHTML = "<br> Après toute cette perte de temps, tu as gagné... Mais, garde ça pour toi si tu veux avoir des amis! <br>";

	} else if(empBad >= 4 && tryRemain == 0)  
	{ // Si 4 empty sont precede d'un empty ou d'un king ET que tout les chances 
	  // pour brasser sont epuise, alors nous avons un perdant	
		span.innerHTML = "<br> Pas assez pour Harvard. Réessaye! <br>";
	}
}

function testsUnitaire ()
{
	// Pas de test pour init(), on ne peux test de l'alÃ©atoire
    // Pas de test pour shuffle, peut pas tester la parti aleatoire
    function compSousTab (tabInit, tabExpec) {
        
        tabInit.forEach(function(x, i){
            
            x.forEach(function(y, j){
               
                if(y != tabExpec[i][j]){
                   
                     console.log("Error at index: [" + i + "][" + j + "]");
                    //print("Error at index: [" + i + "][" + j + "]");
               }
                
            });
        });
    }
    
    tabInit = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 0,
               5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 1,
               6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 2,
               7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 3];

    tabExpec =  [[4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48],
		[5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49],
		[6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50],
		[7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51]];

    compSousTab(getGoodOnes(tabInit), tabExpec);

    tabInit = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 5,
               0, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 1,
               6, 10, 14, 19, 23, 27, 31, 35, 39, 43, 47, 51, 2,
               7, 15, 11, 18, 22, 26, 30, 34, 38, 42, 46, 50, 3];

    tabExpec =  [[4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48],
		[],
		[6, 10, 14],
		[7]];
    
    compSousTab(getGoodOnes(tabInit), tabExpec);
    // Assert ne fonctionne pas, je ne sais pas pk?
}

//testsUnitaire ();
