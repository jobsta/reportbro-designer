/**
 * Empty panel which is shown when no data object is selected.
 * @class
 */
export default class EmptyDetailPanel {
    constructor(rootElement, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
    }

    render() {
        let panel = $('#rbro_detail_panel');
        $('#rbro_detail_panel').append(`<div id="rbro_empty_detail_panel" class="rbroEmptyDetailPanel rbroHidden">
                <div class="rbroLogo"></div>
            </div>`);
    }

    show(data) {
        $('#rbro_empty_detail_panel').removeClass('rbroHidden');
    }

    hide() {
        $('#rbro_empty_detail_panel').addClass('rbroHidden');
    }

    notifyEvent(obj, operation) {
    }

    updateErrors() {
    }
}
