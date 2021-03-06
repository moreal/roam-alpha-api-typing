interface Data {
    redo(): void;
    undo(): void;

    /**
     * Removes pull watch. If no callback provided, clears all watches from pull pattern. If callback provided, only removes watch with that callback.
     * 
     * For example
     * ```javascript
     * window
     *  .roamAlphaAPI
     *  .data
     *  .removePullWatch(
     *      "[:block/children :block/string {:block/children ...}]",
     *      '[:block/uid "02-21-2021"]',
     *      function a(before, after) { console.log("before", before, "after", after);)
     * ```
     */
    removePullWatch(pullPattern: string, entityId: string, callback?: () => void): void;

    /**
     * Watches for changes on pull patterns on blocks and pages and provides a callback to execute after changes are recorded, providing the before and after state to operate on.
     * 
     * For example:
     * ```javascript
     * window
     *  .roamAlphaAPI
     *  .data
     *  .addPullWatch(
     *      "[:block/children :block/string {:block/children ...}]",
     *      '[:block/uid "02-21-2021"]',
     *      function a(before, after) { console.log("before", before, "after", after);)
     * ```
     */
    addPullWatch(pullPattern: string, entityId: string, callback: (before: any, after: any) => void): void;

    upsertUser(_: {
        "user-uid": UserUID,
        "display-name"?: string,
    }): void;
}

interface CommandPalette {
    addCommand(_: {
        label: string,
        callback: () => void;
    }): Object;

    removeCommand(_: {
        label: string,
    }): Object;
}

type RightSidebarWindowType = "block" | "outline" | "mentions" | "graph";

interface RightSidebarWindow {
    "collapased?": boolean,
    /**
     * View type of window to open in the sidebar.
     */
    type: RightSidebarWindowType,
    /**
     * Order of the window from **0** to **n**.
     */
    order: number,
    "window-id": string,
    "pinned?": boolean,
}

interface RightSidebarBlockWindow extends RightSidebarWindow {
    /**
     * Unique identifier for block to open in the right sidebar.
     */
    "block-uid": UID,
}

interface RightSidebarPageWindow extends RightSidebarWindow {
    /**
     * Unique identifier for page to open in the right sidebar.
     */
    "page-uid": UID,
}

interface RightSidebar {
    addWindow(_: {
        window: {
            "block-uid": string,
            type: RightSidebarWindowType,
        },
    }): Promise<true>;

    /**
     * Removes the specific window from the right sidebar.
     * @returns It will return `true` iff all parameters are okay. It may return `null` if @param `block-uid` is invalid.
     */
    removeWindow(_: {
        window: {
            type: RightSidebarWindowType,
            "block-uid": string,
        }
    }): Promise<true | null>;

    expandWindow(_: {
        window: {
            "block-uid": string,
            type: RightSidebarWindowType,
        },
    }): Promise<true>;

    collapseWindow(_: {
        window: {
            "block-uid": string,
            type: RightSidebarWindowType,
        },
    }): Promise<true>;
    getWindows(): (RightSidebarBlockWindow | RightSidebarPageWindow)[];
    pinWindow(_: {
        window: {
            "block-uid": string,
            type: RightSidebarWindowType,
        },
    }): Promise<true>;
    unpinWindow(_: {
        window: {
            "block-uid": string,
            type: RightSidebarWindowType,
        },
    }): Promise<true>;
    open(): Promise<true>;
    close(): Promise<true>;
}

interface Filters {
    addGlobalFilter(): void;
    getGlobalFilters(): void;
    removeGlobalFilter(): void;
}

interface UI {
    commandPalette: CommandPalette;
    getFocusedBlock(): {
        "block-uid": UID,
        "window-id": string,
    };
    rightSidebar: RightSidebar;
    filters: Filters;
}

interface Util {
    generateUID(): UID;
}

type UID = string;
type UserUID = string;

type Order = "first" | "last" | number;

interface Location {
    "parent-uid": string,
    order: Order,
}

interface UIDObject {
    uid: UID,
}

type Block = UIDObject;

type Page = UIDObject;

interface CompletePage extends Page {
    title: string;
}

interface ReferenceableNode {
    ":db/id": number,
}

interface RoamVersionNode extends ReferenceableNode {
    ":version/id": string,
    ":version/nonce": string,
}

type UserSettingsNamespaceOption = ":full" | ":none" | ":partial";

interface UserSettingsNode extends ReferenceableNode {
    ":block/uid": string,

    ":user/display-name": string,
    ":user/settings": {
        ":allow-custom-components?": boolean,
        ":namespace-options": UserSettingsNamespaceOption[]
        ":right-sidebar-pinned": Object
        ":roam/js": {
            ":active-blocks": UID[]
        },
        ":showing-inline-references?": boolean
    },
    ":user/uid": UserUID,
}

interface TreeLikeBlockNode extends ReferenceableNode {
    /**
     * Unique identifier for the block, usually generated by {@link Util#generateUID | window.roamAlphaAPI.util.generateUID()}.
     */
    ":block/uid": UID,

    /**
     * The references of children nodes if it has.
     */
    ":block/children"?: ReferenceableNode[],

    /**
     * The references of nodes which this node referenced.
     */
    ":block/refs"?: ReferenceableNode[],

    /**
     * Timestamp of when the node was created.
     */
    ":create/time"?: number,
    /**
     * The reference node of the {@link UserSettingsNode | user node} who created this node.
     */
    ":create/user"?: ReferenceableNode,

    /**
     * Timestamp of when the node was last edited.
     */
    ":edit/time": number,

    /**
     * The reference node of the {@link UserSettingsNode | user node} who last edited this node.
     */
    ":edit/user": ReferenceableNode,
    ":edit/seen-by"?: ReferenceableNode[],
}

interface PageNode extends TreeLikeBlockNode {
    ":node/title": string,
}

interface DailyPageNode extends PageNode {
    ":log/id": number,
}

type BlockTextAlign = "left" | "center" | "right" | "justify";
type BlockHeading = 1 | 2 | 3;

interface BlockNode extends TreeLikeBlockNode {
    /**
     * Collapse state of the block.
     */
    ":block/open": boolean,

    /**
     * The reference nodes of the parent nodes.
     * 
     * For example, if the block has strucutre like below, it will have three reference nodes of the parents (i.e. [`PageNode`, `parent-a BlockNode`, `parent-b BlockNode`]).
     * 
     * ```
     * PageNode
     * - parent-a BlockNode
     *   - parent-b BlockNode
     *     - current BlockNode
     * ```
     * 
     * This property will not appear when it became orphan from every page or block.
     */
    ":block/parents"?: ReferenceableNode[],

    /**
     * The reference node of the {@link PageNode | page node}.
     */
    ":block/page": ReferenceableNode,

    /**
     * The order of the block node exists in the page. It starts from `1`.
     */
    ":block/order": number,

    /**
     * Text content of the block.
     */
    ":block/string": string,

    /**
     * The heading weight of the block node
     */
    ":block/heading"?: BlockHeading,

    /**
     * The align of the block node's text.
     */
    ":block/text-align"?: BlockTextAlign,
}

/**
 * @alpha
 */
interface RoamAlphaAPI {
    createBlock(_: {
        location: Location,
        block: {
            string: string,
            uid?: UID,
            "user-uid"?: UserUID,
        }
    }): Promise<true>;
    createPage(_: {
        page: {
            title: string,
            uid?: string,
            "user-uid"?: UserUID,
        }
    }): Promise<true>;
    deleteBlock(_: { block: Block }): Promise<true>;
    deletePage(_: { page: Page }): Promise<true>;
    updateBlock(_: {
        block: {
            uid: string,
            string?: string,
            open?: boolean,
            "user-uid"?: UserUID,
        }
    }): Promise<true>;
    updatePage(_: {
        page: {
            title: string,
            uid: string,
            "user-uid"?: UserUID,
        }
    }): Promise<true>;
    moveBlock(_: {
        location: Location,
        block: Block,
    }): Promise<true>;

    /**
     * Pull only properties matched to `pattern`, of database object placed at `id`.
     * 
     * @param pattern The pattern to pull. @see https://docs.datomic.com/on-prem/query/pull.html.
     * @param id The {@link ReferenceableNode#":db/id" | id} of the node to query.
     * 
     * @returns An object made up with properties matched to `pattern`, of database object palced at `id`.
     * @alpha
     */
    pull(pattern: string, id: number): Promise<Object>;

    /**
     * @param pattern The pattern to query. @see https://docs.datomic.com/on-prem/query/query.html.
     * 
     * @alpha
     */
    q(pattern: string): Object[];
    data: Data;
    ui: UI;
    util: Util;
}

interface Window {
    /**
     * @alpha
     */
    roamAlphaAPI: RoamAlphaAPI;
}
