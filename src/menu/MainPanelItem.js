import AddDeleteDocElementCmd from '../commands/AddDeleteDocElementCmd';
import AddDeleteParameterCmd from '../commands/AddDeleteParameterCmd';
import AddDeleteStyleCmd from '../commands/AddDeleteStyleCmd';
import CommandGroupCmd from '../commands/CommandGroupCmd';
import MovePanelItemCmd from '../commands/MovePanelItemCmd';
import SetValueCmd from '../commands/SetValueCmd';
import Parameter from '../data/Parameter';
import Style from '../data/Style';
import DocElement from '../elements/DocElement';
import * as utils from '../utils';

/**
 * A main panel item either represents a data object (doc element, parameter, etc.) or
 * a container (e.g. page header) for other panel items.
 * @class
 */
export default class MainPanelItem {
    constructor(panelName, parent, data, properties, rb) {
        this.properties = {
            hasChildren: false, showAdd: false, showDelete: true, hasDetails: true, visible: true, draggable: false,
            static: false,
        };
        Object.assign(this.properties, properties);
        this.panelName = panelName;
        const name = (data !== null) ? data.getName() : (properties.name ? properties.name : '');
        this.id = (data !== null) ? data.getId() : properties.id;
        this.parent = parent;
        this.data = data;
        this.rb = rb;
        this.children = [];
        this.dragEnterCount = 0;

        this.element = utils.createElement('li');
        if (!this.properties.visible) {
            this.element.classList.add('rbroHidden');
        }
        const itemDiv = utils.createElement('div', { id: `rbro_menu_item${this.id}`, class: 'rbroMenuItem' });
        if (this.properties.draggable) {
            itemDiv.setAttribute('draggable', 'true');
            itemDiv.addEventListener('dragstart', (event) => {
                event.dataTransfer.setData('text/plain', '');  // without setData dragging does not work in FF
                event.dataTransfer.effectAllowed = 'move';
                this.rb.startBrowserDrag('panelItem', null, this.id);
                // avoid calling dragstart handler for main div which disables dragging for all other elements
                event.stopPropagation();
            });
        }
        itemDiv.addEventListener('dragover', (event) => {
            if (this.rb.isBrowserDragActive('panelItem') && this.rb.getBrowserDragId() !== this.id) {
                let dropInfo = this.getDropObjectInfo();
                if (dropInfo.allowDrop) {
                    // without preventDefault for dragover event, the drop event is not fired
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        });
        itemDiv.addEventListener('dragenter', (event) => {
            if (this.rb.isBrowserDragActive('panelItem') && this.rb.getBrowserDragId() !== this.id) {
                let dropInfo = this.getDropObjectInfo();
                if (dropInfo.allowDrop) {
                    itemDiv.classList.add('rbroMenuItemDragOver');
                    this.dragEnterCount++;
                    event.preventDefault(); // needed for IE
                }
            }
        });
        itemDiv.addEventListener('dragleave', (event) => {
            if (this.rb.isBrowserDragActive('panelItem') && this.rb.getBrowserDragId() !== this.id) {
                let dropInfo = this.getDropObjectInfo();
                if (dropInfo.allowDrop) {
                    this.dragEnterCount--;
                    if (this.dragEnterCount === 0) {
                        itemDiv.classList.remove('rbroMenuItemDragOver');
                    }
                }
            }
        });
        itemDiv.addEventListener('drop', (event) => {
            if (this.rb.isBrowserDragActive('panelItem') && this.rb.getBrowserDragId() !== this.id) {
                let dropInfo = this.getDropObjectInfo();
                if (dropInfo.allowDrop) {
                    this.dragEnterCount--;
                    itemDiv.classList.remove('rbroMenuItemDragOver');

                    let cmdGroup = new CommandGroupCmd('Move panel item', this.rb);

                    let draggedObj = this.rb.getDataObject(this.rb.getBrowserDragId());
                    if (draggedObj instanceof DocElement &&
                            draggedObj.getValue('containerId') !== dropInfo.container.getId()) {
                        draggedObj.updatePositionAndSize(draggedObj.getValue('xVal'), draggedObj.getValue('yVal'),
                            draggedObj.getValue('widthVal'), draggedObj.getValue('heightVal'),
                            dropInfo.container.getSize(), cmdGroup);

                        let cmd = new SetValueCmd(
                            draggedObj.getId(), 'containerId',
                            dropInfo.container.getId(), SetValueCmd.type.internal, this.rb);
                        cmdGroup.addCommand(cmd);
                    }
                    let cmd = new MovePanelItemCmd(
                        draggedObj.getPanelItem(), dropInfo.panel, dropInfo.position, this.rb);
                    cmdGroup.addCommand(cmd);
                    this.rb.executeCommand(cmdGroup);
                    event.preventDefault();
                    return false;
                }
            }
        });

        const nameDiv = utils.createElement('div', { class: 'rbroMenuItemText' });
        nameDiv.append(utils.createElement('span', { id: `rbro_menu_item_name${this.id}` }, name));
        if (this.properties.showAdd) {
            const elAddButton = utils.createElement(
                'div', {
                    id: `rbro_menu_item_add${this.id}`,
                    class: 'rbroButton rbroRoundButton rbroIcon-plus'
                });
            elAddButton.addEventListener('click', (event) => {
                if (panelName === 'parameter') {
                    let cmd = new AddDeleteParameterCmd(true, {}, this.rb.getUniqueId(), this.getId(), -1, this.rb);
                    this.rb.executeCommand(cmd);
                } else if (panelName === 'style') {
                    let cmd = new AddDeleteStyleCmd(true, {}, this.rb.getUniqueId(), this.getId(), -1, this.rb);
                    this.rb.executeCommand(cmd);
                } else if (panelName === 'watermarkText' || panelName === 'watermarkImage') {
                    const initialData = { containerId: this.getId() };
                    let docElementType;
                    if (panelName === 'watermarkText') {
                        docElementType = DocElement.type.watermarkText;
                    } else {
                        docElementType = DocElement.type.watermarkImage;
                    }
                    const cmd = new AddDeleteDocElementCmd(
                        true, docElementType, initialData, this.rb.getUniqueId(), this.getId(), -1, this.rb);
                    this.rb.executeCommand(cmd);
                }
                let newItem = this.children[this.children.length - 1];
                this.rb.selectObject(newItem.getId(), true);
                event.stopPropagation();
            });
            itemDiv.append(elAddButton);
        }
        if (this.properties.showDelete) {
            const elDeleteButton = utils.createElement('div', { class: 'rbroButton rbroDeleteButton rbroIcon-cancel' });
            elDeleteButton.addEventListener('click', (event) => {
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
                event.stopPropagation();
            });
            itemDiv.append(elDeleteButton);
        }
        itemDiv.addEventListener('click', (event) => {
            // only allow toggle children list of menu item if there are no details or menu item is currently selected
            if (!this.properties.hasDetails ||
                    document.getElementById(`rbro_menu_item${this.id}`).classList.contains('rbroMenuItemActive')) {
                let elChildren = document.getElementById(`rbro_menu_item_children${this.id}`);
                if (elChildren) {
                    itemDiv.classList.toggle('rbroMenuItemOpen');
                    elChildren.classList.toggle('rbroHidden');
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
            itemDiv.classList.add('rbroMenuItemNoChildren');
            nameDiv.append(
                utils.createElement(
                    'div', {
                        id: `rbro_menu_item_children_toggle${this.id}`,
                        class: 'rbroMenuArrow rbroIcon-arrow-right'
                    }));
            this.element.append(
                utils.createElement('ul', { id: `rbro_menu_item_children${this.id}`, class: 'rbroHidden' }));
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
        this.element.classList.remove('rbroHidden');
    }

    hide() {
        this.element.classList.add('rbroHidden');
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
        document.getElementById(`rbro_menu_item_name${this.id}`).textContent = (data !== null) ? data.getName() : '';
    }

    setActive() {
        document.getElementById(`rbro_menu_item${this.id}`).classList.add('rbroMenuItemActive');
    }

    setInactive() {
        document.getElementById(`rbro_menu_item${this.id}`).classList.remove('rbroMenuItemActive');
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
        let elChildren = document.getElementById(`rbro_menu_item_children${this.getId()}`);
        if (elChildren) {
            document.getElementById(`rbro_menu_item${this.getId()}`).classList.add('rbroMenuItemOpen');
            elChildren.classList.remove('rbroHidden');
        }
    }

    close() {
        let elChildren = document.getElementById(`rbro_menu_item_children${this.getId()}`);
        if (elChildren) {
            document.getElementById(`rbro_menu_item${this.getId()}`).classList.remove('rbroMenuItemOpen');
            elChildren.classList.add('rbroHidden');
        }
    }

    appendChild(child) {
        if (this.children.length === 0) {
            document.getElementById(`rbro_menu_item${this.getId()}`).classList.remove('rbroMenuItemNoChildren');
        }
        this.children.push(child);
        document.getElementById(`rbro_menu_item_children${this.getId()}`).append(child.getElement());
    }

    insertChild(pos, child) {
        if (this.children.length === 0) {
            document.getElementById(`rbro_menu_item${this.getId()}`).classList.remove('rbroMenuItemNoChildren');
        }
        if (pos !== -1) {
                this.children.splice(pos, 0, child);
        } else {
            this.children.push(child);
        }
        let elChildren = document.querySelectorAll(`#rbro_menu_item_children${this.getId()} > li`);
        if (pos >= 0 && pos < elChildren.length) {
            elChildren[pos].before(child.getElement());
        } else {
            document.getElementById(`rbro_menu_item_children${this.getId()}`).append(child.getElement());
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
     * @returns {?MainPanelItem} child panel or null if no child with given name exists.
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
     * @param {?Object} excludeChild - data object which will be excluded from search.
     * @returns {?MainPanelItem} child panel or null if no child with given name exists.
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
                    const elMenuItem = document.getElementById(`rbro_menu_item${this.getId()}`);
                    // test if menu item exists, when all document elements are deleted before
                    // loading a report and the parent element of this child was deleted before (e.g. parent is
                    // a frame element and the child a text element inside the frame) then the menu item does
                    // not exist anymore when deleting the child.
                    if (elMenuItem !== null) {
                        elMenuItem.classList.add('rbroMenuItemNoChildren');
                    }
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
        this.element.parentElement.removeChild(this.element);
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
        this.element.parentElement.removeChild(this.element);
        this.parent.removeChildInternal(this, false);
        this.parent = parentPanelItem;
        parentPanelItem.insertChild(pos, this);
    }

    clear() {
        if (this.children.length > 0) {
            // static items (e.g. sub category for watermarks) are not cleared, therefor the children have
            // to be cleared individually
            if (this.properties.static) {
                for (const child of this.children) {
                    child.clear();
                }
            } else {
                utils.emptyElement(document.getElementById(`rbro_menu_item_children${this.id}`));
                this.children = [];
            }
        }
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
                    // if the dragged object has linked containers (section or frame) then we make sure
                    // we cannot drag the object into one of its container children
                    for (const linkedContainer of draggedObj.getLinkedContainers()) {
                        if (linkedContainer === rv.container || rv.container.isChildOf(linkedContainer)) {
                            rv.allowDrop = false;
                            break;
                        }
                    }
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
            this.panelName === DocElement.type.frame || this.panelName === DocElement.type.section ||
            this.panelName === DocElement.type.watermarkText || this.panelName === DocElement.type.watermarkImage;
    }
}
