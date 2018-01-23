
function carrelloRemove(index) {
    ajaxCall("POST", window.location.origin + '/carrello/remove', 5000, {
        index: index
    }, function (data) {
        window.location = window.location.origin + '/carrello';
    });
}
function carrelloUpdate(index, quantity) {
    ajaxCall("POST", window.location.origin + '/carrello/update', 5000, {
        index: index,
        quantity: quantity
    }, function (data) {
        window.location = window.location.origin + '/carrello';
    });
}