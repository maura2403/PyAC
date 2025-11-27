function openFieldMenu(button) {
    const popupId = button.dataset.popup;
    var popup = document.getElementById(popupId);
    //popup.classList.toggle("show");

    if (popup.classList.contains("show")) {
        popup.classList.remove("show");
        return;
    }

    const th = button.closest("th");
    const rect = th.getBoundingClientRect();

    popup.style.width = rect.width + "px";
    popup.style.top = (rect.bottom + 4) + "px";
    popup.style.left = rect.left + rect.width / 2 + "px";
    popup.style.transform = "translateX(-50%)";
    popup.style.minWidth = rect.width + "px";

    popup.classList.add("show");

}

document.addEventListener("click", (e) => {
    const popups = document.querySelectorAll(".field-menu-popup.show");
    popups.forEach(popup => {
        if (!popup.contains(e.target) && !e.target.closest(".field-menu")) {
            popup.classList.remove("show");
        }
    });
});

function constructUrlWithParams(urlDict){
    const url = location.origin + location.pathname;
    return `${url}?filter=${JSON.stringify(urlDict.filter)}&sortby=${JSON.stringify(urlDict.sortby)}`;
}

function parseUrlWithParams(currentLocation) {
    const params = new URLSearchParams(currentLocation.search);
    const urlDict = {
        filter: {},
        sortby: {}
    };

    for (const [key, value] of params.entries()) {
        const match = key.match(/^(filter|sortby)\[(.+)\]$/);
        if (match) {
            urlDict[match[1]][match[2]] = value;
        }
    }

    try {
        if (params.get("filter")) {
            urlDict.filter = JSON.parse(params.get("filter"));
        }
        if (params.get("sortby")) {
            urlDict.sortby = JSON.parse(params.get("sortby"));
        }
    } catch (e) {
        console.error("JSON Invalido en los parametros de la URL", e);
    }

    return urlDict;
}

function filterBooleanField(button){
    const previous_order = button.dataset.action;
    const field = button.closest("th").dataset.key;
    let action;
    switch(previous_order) {
        case "true":
            action="false";
            break;
        case "false":
            action="none";
            break;
        case "none":
            action="true";
            break;
        default:
            action="none";
            break;
    }

    const urlDict = parseUrlWithParams(location);

    if(action === "true" || action === "false"){
        urlDict.filter[field] = action;
    }
    else{
        delete urlDict.filter[field];
    }

    const newUrl = constructUrlWithParams(urlDict);
    location.href = newUrl;
}

function sortField(button) {
    const previous_order = button.dataset.action;
    const field = button.closest("th").dataset.key;
    let action;

    switch(previous_order) {
        case "none":
            action="asc";
            break;
        case "asc":
            action="desc";
            break;
        case "desc":
            action="none";
            break;
        default:
            action="none";
            break;
    }

    const urlDict = parseUrlWithParams(location);

    if(action === "asc" || action === "desc"){
        urlDict.sortby[field] = action;
    }
    else{
        delete urlDict.sortby[field];
    }

    const newUrl = constructUrlWithParams(urlDict);
    location.href = newUrl;

}

function filterField(event){
    event.preventDefault(); // para que no se mande el formulario por query params por default sino que lo mandamos al final de la funcion
    const form = event.target;

    const field = form.dataset.key;
    const urlDict = parseUrlWithParams(location);

    const checkboxes = form.querySelectorAll(".filter-checkbox");
    let value;

    if (checkboxes.length > 0) {
        value = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
    } else {
        const input = form.querySelector(".filter-input");
        value = input.value.trim() !== "" ? input.value.trim() + '%' : null;
    }

    if (Array.isArray(value) ? value.length > 0 : value) {
        urlDict.filter[field] = value;
    } else {
        delete urlDict.filter[field];
    }
    const newUrl = constructUrlWithParams(urlDict);
    location.href = newUrl;

}
