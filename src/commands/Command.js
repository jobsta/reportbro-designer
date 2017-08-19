export default class Command {
    getName() {}
    do() {}
    undo() {}
}

Command.operation = {
    rename: 'rename',
    change: 'change',
    add: 'add',
    remove: 'remove',
    move: 'move'
}