
import * as d3 from 'https://unpkg.com/d3?module';  // npm install d3 or yarn add d3
import f3 from 'https://unpkg.com/family-chart?module';  // npm install family-chart@0.7.4 or yarn add family-chart@0.7.4

fetch('./data/data_marot.json')
    .then(res => res.json())
    .then(data => create(data))
    .catch(err => console.error(err))

function create(data) {
    const f3Chart = f3.createChart('#FamilyChart', data)
        .setTransitionTime(1000)
        .setCardXSpacing(250)
        .setCardYSpacing(150)

    f3Chart.setCard(f3.CardHtml)
        .setCardDisplay([["fn","ln"]])
        .setCardDim({h:70})

    f3Chart.updateTree({initial: true})


    // with person_id this function will update the tree
    function updateTreeWithNewMainPerson(person_id, animation_initial = true) {
        f3Chart.updateMainId(person_id)
        f3Chart.updateTree({initial: animation_initial})
    }



    // setup search dropdown
    // this is basic showcase, please use some autocomplete component and style it as you want

    const all_select_options = []
    data.forEach(d => {
        if (all_select_options.find(d0 => d0.value === d["id"])) return
        all_select_options.push({label: `${d.data["fn"]} ${d.data["ln"]}`, value: d["id"]})
    })
    const search_cont = d3.select(document.querySelector("#FamilyChart")).append("div")
        .attr("style", "position: absolute; top: 10px; left: 10px; width: 150px; z-index: 1000;")
        .on("focusout", () => {
            setTimeout(() => {
                if (!search_cont.node().contains(document.activeElement)) {
                    updateDropdown([]);
                }
            }, 200);
        })
    const search_input = search_cont.append("input")
        .attr("style", "width: 100%;")
        .attr("type", "text")
        .attr("placeholder", "Search")
        .on("focus", activateDropdown)
        .on("input", activateDropdown)

    const dropdown = search_cont.append("div").attr("style", "overflow-y: auto; max-height: 300px; background-color: #000;")
        .attr("tabindex", "0")
        .on("wheel", (e) => {
            e.stopPropagation()
        })

    function activateDropdown() {
        const search_input_value = search_input.property("value")
        const filtered_options = all_select_options.filter(d => d.label.toLowerCase().includes(search_input_value.toLowerCase()))
        updateDropdown(filtered_options)
    }

    function updateDropdown(filtered_options) {
        dropdown.selectAll("div").data(filtered_options).join("div")
            .attr("style", "padding: 5px;cursor: pointer;border-bottom: .5px solid currentColor;")
            .on("click", (e, d) => {
                updateTreeWithNewMainPerson(d.value, true)
            })
            .text(d => d.label)
    }
}
