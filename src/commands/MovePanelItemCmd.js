import Command from './Command';
import DocElement from '../elements/DocElement';
import Document from '../Document';

/**
 * Command to move a menu panel item. In case the item is moved to a different container (e.g. from content to header band)
 * the corresponding doc element is moved to the new container as well.
 * @class
 */
export default class MovePanelItemCmd {
    constructor(panelItem, moveToParentPanel, moveToPosition, rb) {
        this.objId = panelItem.getId();
        this.moveToParentId = moveToParentPanel.getId();
        this.moveToPosition = moveToPosition;
        this.oldParentId = panelItem.getParent().getId();
        this.oldPosition = panelItem.getSiblingPosition();
        this.oldContainerId = null;
        this.moveToContainerId = null;
        if (panelItem.getData() instanceof DocElement) {
            let docElement = panelItem.getData();
            this.oldContainerId = docElement.getValue('containerId');
            let moveToContainer = rb.getMainPanel().getContainerByItem(moveToParentPanel);
            if (moveToContainer !== null) {
                this.moveToContainerId = moveToContainer.getId();
            }
        }
        this.rb = rb;
    }

    getName() {
        return 'Move panel item';
    }

    do() {
        let pos = this.moveToPosition;
        if (this.moveToParentId === this.oldParentId && this.oldPosition < pos) {
            pos--;
        }
        this.moveTo(this.moveToParentId, pos, (this.moveToContainerId !== this.oldContainerId) ? this.moveToContainerId : null);
    }

    undo() {
        this.moveTo(this.oldParentId, this.oldPosition, (this.moveToContainerId !== this.oldContainerId) ? this.oldContainerId : null);
    }

    moveTo(toParentId, toPosition, toContainerId) {
        let obj = this.rb.getDataObject(this.objId);
        let parent = this.rb.getDataObject(toParentId);
        if (obj !== null && parent !== null) {
            obj.getPanelItem().moveToPosition(parent.getPanelItem(), toPosition);
            obj.getPanelItem().openParentItems();
            this.rb.notifyEvent(obj, Command.operation.move);
        }
    }
}
