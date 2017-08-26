import AddDeleteDocElementCmd from '../commands/AddDeleteDocElementCmd';
import AddDeleteParameterCmd from '../commands/AddDeleteParameterCmd';
import AddDeleteStyleCmd from '../commands/AddDeleteStyleCmd';
import MovePanelItemCmd from '../commands/MovePanelItemCmd';
import Container from '../container/Container';
import Parameter from '../data/Parameter';
import DocElement from '../elements/DocElement';
import Document from '../Document';

/**
 * A main panel item either represents a data object (doc element, parameter, etc.) or a container (e.g. page header) for
 * other panel items.
 * @class
 */
export default class MainPanelItem {
    constructor(panelName, panelCategory, panelLabel, parent, data, properties, rb) {
        this.properties = { hasChildren: false, showAdd: false, showDelete: true, hasDetails: true, visible: true, draggable: false };
        $.extend( this.properties, properties );
        this.panelName = panelName;
        this.panelCategory = panelCategory;
        let name = data.getName();
        this.id = data.getId();
        this.parent = parent;
        this.data = data;
        this.rb = rb;
        this.children = [];
        this.dragEnterCount = 0;

        this.element = $('<li></li>');
        if (!this.properties.visible) {
            this.element.addClass('rbroHidden');
        }
        let itemDiv = $(`<div id="rbro_menu_item${this.id}" class="rbroMenuItem"></div>`);
        if (this.properties.draggable) {
            itemDiv.attr('draggable', 'true');
            itemDiv.on('dragstart', event => {
                event.originalEvent.dataTransfer.setData('text/plain', '');  // without setData dragging does not work in FF
                event.originalEvent.dataTransfer.effectAllowed = 'move';
                this.rb.startBrowserDrag('panelItem', this.panelCategory, null, this.id);
                // avoid calling dragstart handler for main div which disables dragging for all other elements
                event.stopPropagation();
            });
        }
        itemDiv
            .on('dragover', event => {
                if (this.rb.isBrowserDragActive('panelItem') &&
                        this.rb.getBrowserDragCategory() === this.panelCategory && this.rb.getBrowserDragId() !== this.id) {
                    // without preventDefault for dragover event, the drop event is not fired
                    event.preventDefault();
                    event.stopPropagation();
                }
            })
            .on('dragenter', event => {
                if (this.rb.isBrowserDragActive('panelItem') &&
                        this.rb.getBrowserDragCategory() === this.panelCategory && this.rb.getBrowserDragId() !== this.id) {
                    itemDiv.addClass('rbroMenuItemDragOver');
                    this.dragEnterCount++;
                    event.preventDefault(); // needed for IE
                }
            })
            .on('dragleave', event => {
                if (this.rb.isBrowserDragActive('panelItem') &&
                        this.rb.getBrowserDragCategory() === this.panelCategory && this.rb.getBrowserDragId() !== this.id) {
                    this.dragEnterCount--;
                    if (this.dragEnterCount === 0) {
                        itemDiv.removeClass('rbroMenuItemDragOver');
                    }
                }
            })
            .on('drop', event => {
                if (this.rb.isBrowserDragActive('panelItem') &&
                        this.rb.getBrowserDragCategory() === this.panelCategory && this.rb.getBrowserDragId() !== this.id) {
                    this.dragEnterCount--;
                    itemDiv.removeClass('rbroMenuItemDragOver');
                    let draggedId = this.rb.getBrowserDragId();
                    let draggedObj = this.rb.getDataObject(draggedId);
                    if (draggedObj !== null) {
                        let pos = this.getSiblingPosition();
                        let parentPanel = this;
                        if (this.getParent() !== null) {
                            parentPanel = this.getParent();
                            pos++;
                        }
                        if (parentPanel !== draggedObj.getPanelItem().getParent() ||
                                pos !== draggedObj.getPanelItem().getSiblingPosition()) {
                            let moveItem = false;
                            if (draggedObj instanceof Parameter) {
                                // do not allow dragging array/map into other array/map parameter
                                if ((draggedObj.getValue('type') !== Parameter.type.array &&
                                        draggedObj.getValue('type') !== Parameter.type.map) ||
                                        parentPanel === this.rb.getMainPanel().getParametersItem()) {
                                    moveItem = true;
                                }
                            } else if (draggedObj instanceof DocElement) {
                                let container = null;
                                if (parentPanel.getData() instanceof Container) {
                                    container = parentPanel.getData();
                                } else {
                                    let destObj = parentPanel.getData();
                                    if (destObj instanceof DocElement) {
                                        container = destObj.getContainer();
                                    }
                                }
                                if (container !== null) {
                                    moveItem = container.isElementAllowed(draggedObj.getElementType());
                                }
                            } else {
                                moveItem = true;
                            }

                            if (moveItem) {
                                let cmd = new MovePanelItemCmd(draggedObj.getPanelItem(), parentPanel, pos, this.rb);
                                this.rb.executeCommand(cmd);
                            }
                        }
                    }
                    event.preventDefault();
                    return false;
                }
            });
        
        let nameDiv = $(`<div class="rbroMenuItemText"><span id="rbro_menu_item_name${this.id}">${name}</span></div>`);
        if (this.properties.showAdd) {
            itemDiv.append($(`<span id="rbro_menu_item_add${this.id}" class="rbroButton rbroRoundButton rbroIcon-plus"></span>`)
                .click(event => {
                    if (panelName === 'parameter') {
                        let cmd = new AddDeleteParameterCmd(true, {}, this.rb.getUniqueId(), this.getId(), -1, this.rb);
                        this.rb.executeCommand(cmd);
                    } else if (panelName === 'style') {
                        let cmd = new AddDeleteStyleCmd(true, {}, this.rb.getUniqueId(), this.getId(), -1, this.rb);
                        this.rb.executeCommand(cmd);
                    }
                    let newItem = this.children[this.children.length - 1];
                    this.rb.selectObject(newItem.getId(), true);
                    event.stopPropagation();
                })
            );
        }
        if (this.properties.showDelete) {
            itemDiv.append($('<div class="rbroButton rbroDeleteButton rbroIcon-cancel"></div>')
                .click(event => {
                    let initialData = this.getData().toJS();
                    let pos = this.getSiblingPosition();
                    let cmd = null;
                    if (panelName === 'parameter') {
                        cmd = new AddDeleteParameterCmd(false, initialData, this.getId(), this.parent.getId(), pos, this.rb);
                    } else if (panelName === 'style') {
                        cmd = new AddDeleteStyleCmd(false, initialData, this.getId(), this.parent.getId(), pos, this.rb);
                    } else if (panelName === DocElement.type.text || panelName === DocElement.type.image ||
                            panelName === DocElement.type.line || panelName === DocElement.type.table ||
                            panelName === DocElement.type.pageBreak) {
                        cmd = new AddDeleteDocElementCmd(false, panelName, initialData, this.getId(), this.parent.getId(), pos, this.rb);
                    }
                    if (cmd !== null) {
                        this.rb.executeCommand(cmd);
                    }
                })
            );
        }
        itemDiv.click(event => {
            // only allow toggle children list of menu item if there are no details or menu item is currently selected
            if (!this.properties.hasDetails || $(`#rbro_menu_item${this.id}`).hasClass('rbroMenuItemActive')) {
                let elChildren = $(`#rbro_menu_item_children${this.id}`);
                if (elChildren.length > 0) {
                    itemDiv.toggleClass('rbroMenuItemOpen');
                    elChildren.toggleClass('rbroHidden');
                }
            }
            if (this.properties.hasDetails) {
                this.rb.selectObject(this.id, true);
            }
        });
        if (this.properties.hasChildren) {
            itemDiv.addClass('rbroMenuItemNoChildren rbroMenuItemOpen');
            nameDiv.prepend(`<div id="rbro_menu_item_children_toggle${this.id}" class="rbroMenuArrow rbroIcon-arrow-right"></div>`);
            this.element.append($(`<ul id="rbro_menu_item_children${this.id}"></ul>`));
        }
        itemDiv.prepend(nameDiv);
        this.element.prepend(itemDiv);
    }

    getId() {
        return this.id;
    }

    getElement() {
        return this.element;
    }

    show() {
        this.element.removeClass('rbroHidden');
    }

    hide() {
        this.element.addClass('rbroHidden');
    }

    getPanelName() {
        return this.panelName;
    }

    getParent() {
        return this.parent;
    }

    getData() {
        return this.data;
    }

    setActive() {
        $('.rbroMenuItem').removeClass('rbroMenuItemActive');
        $(`#rbro_menu_item${this.id}`).addClass('rbroMenuItemActive');
        this.rb.setDetailPanel(this.panelName, this.data);
    }

    openParentItems() {
        let parent = this.getParent();
        while (parent !== null) {
            parent.open();
            parent = parent.getParent();
        }
    }

    open() {
        let elChildren = $(`#rbro_menu_item_children${this.getId()}`);
        if (elChildren.length > 0) {
            $(`#rbro_menu_item${this.getId()}`).addClass('rbroMenuItemOpen');
            elChildren.removeClass('rbroHidden');
        }
    }

    close() {
        let elChildren = $(`#rbro_menu_item_children${this.getId()}`);
        if (elChildren.length > 0) {
            $(`#rbro_menu_item${this.getId()}`).removeClass('rbroMenuItemOpen');
            elChildren.addClass('rbroHidden');
        }
    }

    appendChild(child) {
        if (this.children.length === 0) {
            $(`#rbro_menu_item${this.getId()}`).removeClass('rbroMenuItemNoChildren');
        }
        this.children.push(child);
        $(`#rbro_menu_item_children${this.getId()}`).append(child.getElement());
    }

    insertChild(pos, child) {
        if (this.children.length === 0) {
            $(`#rbro_menu_item${this.getId()}`).removeClass('rbroMenuItemNoChildren');
        }
        if (pos !== -1) {
                this.children.splice(pos, 0, child);
        } else {
            this.children.push(child);
        }
        let elChildren = $(`#rbro_menu_item_children${this.getId()} > li`);
        if (pos !== -1 && pos < elChildren.length) {
            elChildren.eq(pos).before(child.getElement());
        } else {
            $(`#rbro_menu_item_children${this.getId()}`).append(child.getElement());
        }
    }

    getChildren() {
        return this.children;
    }

    removeChild(child) {
        this.removeChildInternal(child, true);
    }

    removeChildInternal(child, deleteDomNode) {
        for (let i=0; i < this.children.length; i++) {
            if (child.getId() === this.children[i].getId()) {
                this.children.splice(i, 1);
                if (deleteDomNode) {
                    child.getElement().remove();
                }
                if (this.children.length === 0) {
                    $(`#rbro_menu_item${this.getId()}`).addClass('rbroMenuItemNoChildren');
                }
                break;
            }
        }
    }

    getSiblingPosition() {
        if (this.getParent() !== null) {
            let siblings = this.getParent().getChildren();
            for (let i=0; i < siblings.length; i++) {
                if (siblings[i] === this) {
                    return i;
                }
            }
        }
        return 0;
    }

    /**
     * Move panel item to another parent.
     * The panel will be appended to the parent, i.e. added after all children of the parent.
     * @param {MainPanelItem} parentPanelItem - new parent panel
     */
    moveTo(parentPanelItem) {
        let el = this.element.detach();
        this.parent.removeChildInternal(this, false);
        this.parent = parentPanelItem;
        parentPanelItem.appendChild(this);
    }

    /**
     * Move panel item to another parent at given position.
     * @param {MainPanelItem} parentPanelItem - new parent panel
     * @param {Number} pos - Position index in children list of new parent where the panel will be inserted.
     */
    moveToPosition(parentPanelItem, pos) {
        let el = this.element.detach();
        this.parent.removeChildInternal(this, false);
        this.parent = parentPanelItem;
        parentPanelItem.insertChild(pos, this);
    }

    clear() {
        $(`#rbro_menu_item_children${this.id}`).empty();
        this.children = [];
    }
}
