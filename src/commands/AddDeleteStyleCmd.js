import Command from './Command';
import Style from '../data/Style';
import MainPanelItem from '../menu/MainPanelItem';

/**
 * Command to add and delete a style.
 * @class
 */
export default class AddDeleteStyleCmd {
    constructor(add, initialData, id, parentId, position, rb) {
        this.add = add;
        this.initialData = initialData;
        this.parentId = parentId;
        this.position = position;
        this.rb = rb;
        this.id = id;
    }

    getName() {
        if (this.add) {
            return 'Add style';
        } else {
            return 'Delete style';
        }
    }

    do() {
        if (this.add) {
            this.addStyle();
        } else {
            this.deleteStyle();
        }
    }

    undo() {
        if (this.add) {
            this.deleteStyle();
        } else {
            this.addStyle();
        }
    }

    addStyle() {
        let parent = this.rb.getDataObject(this.parentId);
        if (parent !== null) {
            let style = new Style(this.id, this.initialData, this.rb);
            let panelItem = new MainPanelItem('style', parent.getPanelItem(), style, { draggable: true }, this.rb);
            panelItem.openParentItems();
            style.setPanelItem(panelItem);
            parent.getPanelItem().insertChild(this.position, panelItem);
            this.rb.addStyle(style);
        }
    }

    deleteStyle() {
        let style = this.rb.getDataObject(this.id);
        if (style !== null) {
            this.initialData = style.toJS();
            this.rb.deleteStyle(style);
            style.getPanelItem().getParent().removeChild(style.getPanelItem());
        }
    }
}