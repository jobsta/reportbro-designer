import * as utils from '../utils';

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
        const elDetailPanel = utils.createElement(
            'div', { id: 'rbro_empty_detail_panel', class: 'rbroEmptyDetailPanel rbroHidden' });
        elDetailPanel.append(utils.createElement('div', { class: 'rbroLogo' }));
        document.getElementById('rbro_detail_panel').append(elDetailPanel);
    }

    destroy() {
    }

    show(data) {
        document.getElementById('rbro_empty_detail_panel').classList.remove('rbroHidden');
    }

    hide() {
        document.getElementById('rbro_empty_detail_panel').classList.add('rbroHidden');
    }

    isKeyEventDisabled() {
        return false;
    }

    notifyEvent(obj, operation) {
    }

    updateErrors() {
    }
}
