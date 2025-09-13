import * as d3 from 'https://unpkg.com/d3?module';

/**
 * Module de gestion de la recherche pour l'arbre généalogique
 */
class SearchController {
    constructor(containerId, data, updateCallback) {
        this.containerId = containerId;
        this.data = data;
        this.updateCallback = updateCallback;
        this.allSelectOptions = [];
        this.searchContainer = null;
        this.searchInput = null;
        this.dropdown = null;
        this.init();
    }

    init() {
        this.buildSelectOptions();
        this.createSearchInterface();
    }

    buildSelectOptions() {
        this.data.forEach(d => {
            if (this.allSelectOptions.find(d0 => d0.value === d["id"])) return;
            this.allSelectOptions.push({
                label: `${d.data["fn"]} ${d.data["ln"]}`,
                value: d["id"]
            });
        });
    }

    createSearchInterface() {
        const container = d3.select(document.querySelector(this.containerId));

        this.searchContainer = container.append("div")
            .attr("id", "search-container")
            .attr("style", `
                position: absolute; 
                top: 10px; 
                left: 10px; 
                width: 200px; 
                z-index: 1000;
            `)
            .on("focusout", () => {
                setTimeout(() => {
                    if (!this.searchContainer.node().contains(document.activeElement)) {
                        this.updateDropdown([]);
                    }
                }, 200);
            });

        this.createSearchInput();
        this.createDropdown();
    }

    createSearchInput() {
        this.searchInput = this.searchContainer.append("input")
            .attr("id", "family-search-input")
            .attr("type", "text")
            .attr("placeholder", "Rechercher une personne...")
            .attr("style", `
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #555;
                border-radius: 4px;
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                font-size: 14px;
                outline: none;
                transition: border-color 0.3s;
            `)
            .on("focus", () => {
                this.searchInput.style("border-color", "#4CAF50");
                this.activateDropdown();
            })
            .on("blur", () => {
                this.searchInput.style("border-color", "#555");
            })
            .on("input", () => this.activateDropdown())
            .on("keydown", (event) => this.handleKeyboardNavigation(event));
    }

    createDropdown() {
        this.dropdown = this.searchContainer.append("div")
            .attr("id", "search-dropdown")
            .attr("style", `
                overflow-y: auto; 
                max-height: 300px; 
                background-color: rgba(0, 0, 0, 0.95);
                border: 1px solid #555;
                border-top: none;
                border-radius: 0 0 4px 4px;
                margin-top: -1px;
                display: none;
            `)
            .attr("tabindex", "0")
            .on("wheel", (event) => {
                event.stopPropagation();
            });
    }

    activateDropdown() {
        const searchValue = this.searchInput.property("value").toLowerCase();
        const filteredOptions = this.allSelectOptions.filter(d =>
            d.label.toLowerCase().includes(searchValue)
        );

        this.updateDropdown(filteredOptions);
    }

    updateDropdown(filteredOptions) {
        if (filteredOptions.length === 0) {
            this.dropdown.style("display", "none");
            return;
        }

        this.dropdown.style("display", "block");

        const options = this.dropdown.selectAll("div")
            .data(filteredOptions)
            .join("div")
            .attr("class", "search-option")
            .attr("style", `
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 0.5px solid #444;
                color: white;
                transition: background-color 0.2s;
            `)
            .on("click", (event, d) => {
                this.selectPerson(d);
            })
            .on("mouseover", function() {
                d3.select(this).style("background-color", "#333");
            })
            .on("mouseout", function() {
                d3.select(this).style("background-color", "transparent");
            })
            .text(d => d.label);

        // Limiter le nombre d'options affichées pour les performances
        if (filteredOptions.length > 10) {
            options.filter((d, i) => i >= 10).remove();
        }
    }

    selectPerson(person) {
        this.searchInput.property("value", person.label);
        this.dropdown.style("display", "none");

        // Appel du callback pour mettre à jour l'arbre
        if (this.updateCallback) {
            this.updateCallback(person.value, true);
        }
    }

    handleKeyboardNavigation(event) {
        const options = this.dropdown.selectAll(".search-option");
        const currentSelected = this.dropdown.select(".selected");

        switch(event.key) {
            case "ArrowDown":
                event.preventDefault();
                this.navigateOptions(options, "down");
                break;
            case "ArrowUp":
                event.preventDefault();
                this.navigateOptions(options, "up");
                break;
            case "Enter":
                event.preventDefault();
                const selected = this.dropdown.select(".selected");
                if (!selected.empty()) {
                    const selectedData = selected.datum();
                    this.selectPerson(selectedData);
                }
                break;
            case "Escape":
                this.dropdown.style("display", "none");
                this.searchInput.node().blur();
                break;
        }
    }

    navigateOptions(options, direction) {
        if (options.empty()) return;

        const currentSelected = this.dropdown.select(".selected");
        let nextIndex = 0;

        if (!currentSelected.empty()) {
            const currentIndex = options.nodes().indexOf(currentSelected.node());
            if (direction === "down") {
                nextIndex = (currentIndex + 1) % options.size();
            } else {
                nextIndex = currentIndex === 0 ? options.size() - 1 : currentIndex - 1;
            }
        }

        // Retirer la sélection précédente
        options.classed("selected", false)
            .style("background-color", "transparent");

        // Ajouter la nouvelle sélection
        const nextOption = d3.select(options.nodes()[nextIndex]);
        nextOption.classed("selected", true)
            .style("background-color", "#4CAF50");
    }

    // Méthodes publiques
    clearSearch() {
        this.searchInput.property("value", "");
        this.dropdown.style("display", "none");
    }

    focusSearch() {
        this.searchInput.node().focus();
    }

    setPlaceholder(placeholder) {
        this.searchInput.attr("placeholder", placeholder);
    }

    addPerson(person) {
        // Ajouter une nouvelle personne aux options de recherche
        if (!this.allSelectOptions.find(d => d.value === person.id)) {
            this.allSelectOptions.push({
                label: `${person.data.fn} ${person.data.ln}`,
                value: person.id
            });
        }
    }

    removePerson(personId) {
        // Retirer une personne des options de recherche
        this.allSelectOptions = this.allSelectOptions.filter(d => d.value !== personId);
    }

    destroy() {
        // Nettoyage
        if (this.searchContainer) {
            this.searchContainer.remove();
        }
    }
}

export default SearchController;