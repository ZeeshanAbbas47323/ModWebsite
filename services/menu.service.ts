import apiClient from "@/lib/axios";

export interface MenuNode {
  id: number;
  name: string;
  slug: string;
  menu_type: string;
  parent_id: number | null;
  sort_order: number;
  icon: string | null;
  link_type: string;
  link_value: string | null;
  target_category_id: number | null;
  target_product_id: number | null;
  target_page_id: number | null;
  external_url: string | null;
  open_in_new_tab: boolean;
  visibility: boolean;
  is_active: boolean;
  children?: MenuNode[];
}

function buildTree(items: MenuNode[]): MenuNode[] {
  const map = new Map<number, MenuNode>();
  const roots: MenuNode[] = [];

  for (const item of items) {
    map.set(item.id, { ...item, children: [] });
  }

  for (const item of map.values()) {
    if (item.parent_id && map.has(item.parent_id)) {
      map.get(item.parent_id)!.children!.push(item);
    } else {
      roots.push(item);
    }
  }

  const sort = (nodes: MenuNode[]): MenuNode[] => {
    nodes.sort((a, b) => a.sort_order - b.sort_order);
    for (const n of nodes) {
      if (n.children?.length) sort(n.children);
      else delete n.children;
    }
    return nodes;
  };

  return sort(roots);
}

export const menuService = {
  getTree: async (): Promise<MenuNode[]> => {
    const { data } = await apiClient.get("/menus/tree");
    const items: MenuNode[] = data.payload ?? data.data ?? [];
    return buildTree(items);
  },
};
