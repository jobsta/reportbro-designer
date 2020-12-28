import AddDeleteParameterCmd from '../commands/AddDeleteParameterCmd';
import AddDeleteStyleCmd from '../commands/AddDeleteStyleCmd';
import CommandGroupCmd from '../commands/CommandGroupCmd';
import MovePanelItemCmd from '../commands/MovePanelItemCmd';
import SetValueCmd from '../commands/SetValueCmd';
import Parameter from '../data/Parameter';
import Style from '../data/Style';
import DocElement from '../elements/DocElement';
import Document from '../Document';

/**
 * A main panel item either represents a data object (doc element, parameter, etc.) or a container (e.g. page header) for
 * other panel items.
 * @class
 */
export default class MainPanelItem {
    constructor(panelName, parent, data, properties, rb) {
        this.properties = { hasChildren: false, showAdd: false, showDelete: true, hasDetails: true, visible: true, draggable: false };
        $.extend( this.properties, properties );
        this.panelName = panelName;
        let name = (data !== null) ? data.getName() : '';
        this.id = (data !== null) ? data.getId() : properties.id;
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
                this.rb.startBrowserDrag('panelItem', null, this.id);
                // avoid calling dragstart handler for main div which disables dragging for all other elements
                event.stopPropagation();
            });
        }
        itemDiv
            .on('dragover', event => {
                if (this.rb.isBrowserDragActive('panelItem') && this.rb.getBrowserDragId() !== this.id) {
                    let dropInfo = this.getDropObjectInfo();
                    if (dropInfo.allowDrop) {
                        // without preventDefault for dragover event, the drop event is not fired
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
            })
            .on('dragenter', event => {
                if (this.rb.isBrowserDragActive('panelItem') && this.rb.getBrowserDragId() !== this.id) {
                    let dropInfo = this.getDropObjectInfo();
                    if (dropInfo.allowDrop) {
                        itemDiv.addClass('rbroMenuItemDragOver');
                        this.dragEnterCount++;
                        event.preventDefault(); // needed for IE
                    }
                }
            })
            .on('dragleave', event => {
                if (this.rb.isBrowserDragActive('panelItem') && this.rb.getBrowserDragId() !== this.id) {
                    let dropInfo = this.getDropObjectInfo();
                    if (dropInfo.allowDrop) {
                        this.dragEnterCount--;
                        if (this.dragEnterCount === 0) {
                            itemDiv.removeClass('rbroMenuItemDragOver');
                        }
                    }
                }
            })
            .on('drop', event => {
                if (this.rb.isBrowserDragActive('panelItem') && this.rb.getBrowserDragId() !== this.id) {
                    let dropInfo = this.getDropObjectInfo();
                    if (dropInfo.allowDrop) {
                        this.dragEnterCount--;
                        itemDiv.removeClass('rbroMenuItemDragOver');

                        let cmdGroup = new CommandGroupCmd('Move panel item', this.rb);

                        let draggedObj = this.rb.getDataObject(this.rb.getBrowserDragId());
                        if (draggedObj instanceof DocElement && draggedObj.getValue('containerId') !== dropInfo.container.getId()) {
                            draggedObj.checkBounds(draggedObj.getValue('xVal'), draggedObj.getValue('yVal'),
                                draggedObj.getValue('widthVal'), draggedObj.getValue('heightVal'),
                                dropInfo.container.getSize(), cmdGroup);

                            let cmd = new SetValueCmd(
                                draggedObj.getId(), 'containerId',
                                dropInfo.container.getId(), SetValueCmd.type.internal, this.rb);
                            cmdGroup.addCommand(cmd);
                        }
                        let cmd = new MovePanelItemCmd(draggedObj.getPanelItem(), dropInfo.panel, dropInfo.position, this.rb);
                        cmdGroup.addCommand(cmd);
                        this.rb.executeCommand(cmdGroup);
                        event.preventDefault();
                        return false;
                    }
                }
            });

        let nameDiv = $(`<div class="rbroMenuItemText"><span id="rbro_menu_item_name${this.id}">${name}</span></div>`);
        if (this.properties.showAdd) {
            itemDiv.append($(`<div id="rbro_menu_item_add${this.id}" class="rbroButton rbroRoundButton rbroIcon-plus"></div>`)
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
                    let cmd = null;
                    if (panelName === 'parameter') {
                        cmd = new AddDeleteParameterCmd(
                            false, this.getData().toJS(), this.getId(), this.parent.getId(),
                            this.getSiblingPosition(), this.rb);
                    } else if (panelName === 'style') {
                        cmd = new CommandGroupCmd('Delete', this);
                        this.getData().addCommandsForDelete(cmd);
                    } else if (this.isDocElementPanel()) {
                        if (this.getData() instanceof DocElement) {
                            cmd = new CommandGroupCmd('Delete', this);
                            this.getData().addCommandsForDelete(cmd);
                        }
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
                if (!this.rb.isSelectedObject(this.id)) {
                    let clearSelection =  true;
                    if (this.isDocElementPanel()) {
                        clearSelection = !event.shiftKey;
                    }
                    this.rb.selectObject(this.id, clearSelection);
                } else {
                    if (event.shiftKey) {
                        this.rb.deselectObject(this.id);
                    }
                }
            }
        });
        if (this.properties.hasChildren) {
            itemDiv.addClass('rbroMenuItemNoChildren');
            nameDiv.append(`<div id="rbro_menu_item_children_toggle${this.id}" class="rbroMenuArrow rbroIcon-arrow-right"></div>`);
            this.element.append($(`<ul id="rbro_menu_item_children${this.id}" class="rbroHidden"></ul>`));
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

    setData(data) {
        this.data = data;
        let name = (data !== null) ? data.getName() : '';
        $(`#rbro_menu_item_name${this.id}`).text(name);
    }

    setActive() {
        $(`#rbro_menu_item${this.id}`).addClass('rbroMenuItemActive');
    }

    setInactive() {
        $(`#rbro_menu_item${this.id}`).removeClass('rbroMenuItemActive');
    }

    getParentIds() {
        let ids = [];
        let parent = this.getParent();
        while (parent !== null) {
            ids.push(parent.id);
            parent = parent.getParent();
        }
        return ids;
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

    /**
     * Returns child where its data object matches the given name.
     *
     * If multiple children have the same name the first child is returned.
     *
     * @param {string} name - name of child to search for.
     * @returns {[MainPanelItem]} child panel or null if no child with given name exists.
     */
    getChildByName(name) {
        return this.getChildByNameExclude(name, null);
    }

    /**
     * Returns child where its data object matches the given name but only if not explicitly excluded.
     *
     * If multiple children have the same name the first child is returned.
     *
     * @param {string} name - name of child to search for.
     * @param {[Object]} excludeChild - data object which will be excluded from search.
     * @returns {[MainPanelItem]} child panel or null if no child with given name exists.
     */
    getChildByNameExclude(name, excludeChild) {
        for (let child of this.children) {
            if (child.getData() !== null && child.getData() !== excludeChild && child.getData().getName() === name) {
                return child;
            }
        }
        return null;
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

    getDropObjectInfo() {
        let rv = { allowDrop: false, panel: null, position: -1, container: null };
        let draggedObj = this.rb.getDataObject(this.rb.getBrowserDragId());
        if (draggedObj !== null) {
            let dropIntoParent = false;
            if (draggedObj instanceof DocElement) {
                if (this.data instanceof DocElement && this.data.isDroppingAllowed()) {
                    // get linked container if available (e.g. container of frame element),
                    // otherwise use the parent container
                    rv.container = this.data.getLinkedContainer();
                    if (rv.container === null) {
                        rv.container = this.data.getContainer();
                        dropIntoParent = true;
                    }
                } else if (this.panelName === 'band') {
                    rv.container = this.data;
                }
                if (rv.container !== null && rv.container.isElementAllowed(draggedObj.getElementType())) {
                    rv.allowDrop = true;
                }
            } else if (draggedObj instanceof Parameter) {
                if (this.data instanceof Parameter) {
                    let parent = this.data.getParent();
                    if (parent !== null) {
                        if (parent.getValue('type') === Parameter.type.array) {
                            if (draggedObj.getValue('type') !== Parameter.type.array &&
                                    draggedObj.getValue('type') !== Parameter.type.map &&
                                    draggedObj.getValue('type') !== Parameter.type.sum &&
                                    draggedObj.getValue('type') !== Parameter.type.average) {
                                rv.allowDrop = true;
                                dropIntoParent = true;
                            }
                        } else if (parent.getValue('type') === Parameter.type.map) {
                            if (draggedObj.getValue('type') !== Parameter.type.array &&
                                    draggedObj.getValue('type') !== Parameter.type.map) {
                                rv.allowDrop = true;
                                dropIntoParent = true;
                            }
                        }
                    } else {
                        rv.allowDrop = true;
                        dropIntoParent = true;
                    }
                } else if (this.panelName === 'parameter') {
                    rv.allowDrop = true;
                }
            } else if (draggedObj instanceof Style) {
                if (this.data instanceof Style) {
                    rv.allowDrop = true;
                    dropIntoParent = true;
                } else if (this.panelName === 'style') {
                    rv.allowDrop = true;
                }
            }

            if (rv.allowDrop) {
                if (dropIntoParent) {
                    rv.panel = this.getParent();
                    rv.position = this.getSiblingPosition() + 1;
                } else {
                    rv.panel = this;
                    rv.position = 0;
                }
                if (rv.panel === null || (rv.panel === draggedObj.getPanelItem().getParent() &&
                        rv.position === draggedObj.getPanelItem().getSiblingPosition())) {
                        // do not allow drop if object is not moved (same parent and position)
                        rv.allowDrop = false;
                    }
            }
        }
        return rv;
    }

    isDocElementPanel() {
        return this.panelName === DocElement.type.text || this.panelName === DocElement.type.image ||
            this.panelName === DocElement.type.line || this.panelName === DocElement.type.table ||
            this.panelName === DocElement.type.pageBreak || this.panelName === DocElement.type.barCode ||
            this.panelName === DocElement.type.frame || this.panelName === DocElement.type.section;
    }
}
