import type { CategoryL1, CategoryL2 } from '@/types'

export const DEFAULT_CATEGORIES_L1: CategoryL1[] = [
  { category_l1_id: 'demolition', name: '拆除工程', icon: '🔨', sort_order: 1 },
  { category_l1_id: 'hard_package', name: '硬装半包', icon: '🧱', sort_order: 2 },
  { category_l1_id: 'hvac', name: '空调地暖', icon: '❄️', sort_order: 3 },
  { category_l1_id: 'doors_windows', name: '门窗工程', icon: '🪟', sort_order: 4 },
  { category_l1_id: 'custom_cabinet', name: '全屋定制', icon: '🚪', sort_order: 5 },
  { category_l1_id: 'materials', name: '主材采购', icon: '🛁', sort_order: 6 },
  { category_l1_id: 'furniture', name: '家具软装', icon: '🛋️', sort_order: 7 },
  { category_l1_id: 'appliances', name: '家电设备', icon: '📺', sort_order: 8 },
  { category_l1_id: 'design', name: '设计费', icon: '📐', sort_order: 9 },
]

export const DEFAULT_CATEGORIES_L2: CategoryL2[] = [
  { category_l2_id: 'demolition_whole', parent_id: 'demolition', name: '全屋拆除', is_custom: false },

  { category_l2_id: 'hard_direct', parent_id: 'hard_package', name: '直接费', is_custom: false },
  { category_l2_id: 'hard_extra', parent_id: 'hard_package', name: '增项/变更', is_custom: false },

  { category_l2_id: 'hvac_ac', parent_id: 'hvac', name: '空调', is_custom: false },
  { category_l2_id: 'hvac_floor', parent_id: 'hvac', name: '地暖', is_custom: false },

  { category_l2_id: 'window_aluminum', parent_id: 'doors_windows', name: '窗户', is_custom: false },
  { category_l2_id: 'window_balcony', parent_id: 'doors_windows', name: '阳台移门', is_custom: false },
  { category_l2_id: 'window_entrance', parent_id: 'doors_windows', name: '入户门', is_custom: false },
  { category_l2_id: 'window_screen', parent_id: 'doors_windows', name: '纱窗', is_custom: false },

  { category_l2_id: 'cabinet_sideboard', parent_id: 'custom_cabinet', name: '餐边柜', is_custom: false },
  { category_l2_id: 'cabinet_entry', parent_id: 'custom_cabinet', name: '玄关柜', is_custom: false },
  { category_l2_id: 'cabinet_master', parent_id: 'custom_cabinet', name: '主卧衣柜', is_custom: false },
  { category_l2_id: 'cabinet_guest', parent_id: 'custom_cabinet', name: '次卧衣柜', is_custom: false },
  { category_l2_id: 'cabinet_balcony', parent_id: 'custom_cabinet', name: '阳台柜', is_custom: false },
  { category_l2_id: 'cabinet_other', parent_id: 'custom_cabinet', name: '其他柜体', is_custom: false },

  { category_l2_id: 'mat_tile', parent_id: 'materials', name: '瓷砖', is_custom: false },
  { category_l2_id: 'mat_floor', parent_id: 'materials', name: '地板', is_custom: false },
  { category_l2_id: 'mat_bath', parent_id: 'materials', name: '卫浴洁具', is_custom: false },
  { category_l2_id: 'mat_kitchen', parent_id: 'materials', name: '厨房橱柜', is_custom: false },
  { category_l2_id: 'mat_light', parent_id: 'materials', name: '灯具开关', is_custom: false },
  { category_l2_id: 'mat_curtain', parent_id: 'materials', name: '窗帘软装', is_custom: false },
  { category_l2_id: 'mat_stone', parent_id: 'materials', name: '石材', is_custom: false },

  { category_l2_id: 'fur_living', parent_id: 'furniture', name: '客厅家具', is_custom: false },
  { category_l2_id: 'fur_dining', parent_id: 'furniture', name: '餐厅家具', is_custom: false },
  { category_l2_id: 'fur_bedroom', parent_id: 'furniture', name: '卧室家具', is_custom: false },
  { category_l2_id: 'fur_study', parent_id: 'furniture', name: '书房家具', is_custom: false },
  { category_l2_id: 'fur_decor', parent_id: 'furniture', name: '软装饰品', is_custom: false },

  { category_l2_id: 'app_kitchen', parent_id: 'appliances', name: '厨房电器', is_custom: false },
  { category_l2_id: 'app_cleaning', parent_id: 'appliances', name: '清洁电器', is_custom: false },
  { category_l2_id: 'app_av', parent_id: 'appliances', name: '影音设备', is_custom: false },
  { category_l2_id: 'app_env', parent_id: 'appliances', name: '环境电器', is_custom: false },
  { category_l2_id: 'app_smart', parent_id: 'appliances', name: '智能设备', is_custom: false },

  { category_l2_id: 'design_fee', parent_id: 'design', name: '设计费', is_custom: false },
]

export const PAYMENT_NODES: string[] = ['定金', '首款', '中期款', '尾款', '其他']
