import Command from './Command';
import DocElement from '../elements/DocElement';
import Document from '../Document';

export default class MovePanelItemCmd {
    constructor(panelItem, moveToParentPanel, moveToPosition, rb) {
        this.objId = panelItem.getId();
        this.moveToParentId = moveToParentPanel.getId();
        this.moveToPosition = moveToPosition;
        this.oldParentId = panelItem.getParent().getId();
        this.oldPosition = panelItem.getSiblingPosition();
        this.oldContainerId = null;
        this.moveToContainerId = null;
        this.docElementY = this.docElementHeight = 0;
        if (panelItem.getData() instanceof DocElement) {
            let docElement = panelItem.getData();
            this.oldContainerId = docElement.getValue('containerId');
            let moveToContainer = rb.getMainPanel().getContainerByItem(moveToParentPanel);
            if (moveToContainer !== null) {
                this.moveToContainerId = moveToContainer.getId();
            }
            this.docElementY = docElement.getValue('yVal');
            this.docElementHeight = docElement.getValue('heightVal');
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
            if (toContainerId !== null) {
                if (obj.getValue('yVal') != this.docElementY) {
                    obj.setValue('y', '' + this.docElementY);
                }
                if (obj.getValue('heightVal') != this.docElementHeight) {
                    obj.setValue('height', '' + this.docElementHeight);
                }
                obj.setValue('containerId', toContainerId);
            }
            obj.getPanelItem().moveToPosition(parent.getPanelItem(), toPosition);
            this.rb.notifyEvent(obj, Command.operation.move);
        }
    }
}
