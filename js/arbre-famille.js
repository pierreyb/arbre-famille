
import * as d3 from 'https://unpkg.com/d3?module';  // npm install d3 or yarn add d3
import f3 from 'https://unpkg.com/family-chart?module';  // npm install family-chart@0.7.4 or yarn add family-chart@0.7.4
import SearchController from './function-search.js';  // Import du module de recherche

fetch('./data/data_marot.json')
    .then(res => res.json())
    .then(data => create(data))
    .catch(err => console.error(err))

function create(data) {
    const f3Chart = f3.createChart('#FamilyChart', data)
        .setTransitionTime(1000)
        .setCardXSpacing(250)
        .setCardYSpacing(150)
        .setSingleParentEmptyCard(false)


    f3Chart.setCard(f3.CardHtml)
        .setCardDisplay([["fn","ln"],["bd"]])
        .setCardDim({h:70})

    f3Chart.updateTree({initial: true})

    // Initialisation du contrôleur search
    const searchController = new SearchController('#FamilyChart', data, updateTreeWithNewMainPerson);



    // with person_id this function will update the tree
    function updateTreeWithNewMainPerson(person_id, animation_initial = true) {
        f3Chart.updateMainId(person_id)
        f3Chart.updateTree({initial: animation_initial})
    }



}
