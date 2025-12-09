import { ScheduleBlock, ActivityType, Priority } from './types';

export const INITIAL_PRIORITIES: Priority[] = [
  { id: 1, text: '桥梁智慧检测现场验收', done: false },
  { id: 2, text: '无人机平台用户模块开发', done: false },
  { id: 3, text: 'API 基础学习', done: false },
];

export const INITIAL_SCHEDULE: ScheduleBlock[] = [
  {
    id: '1',
    timeRange: '05:30 - 05:40',
    title: '起床 & 唤醒',
    type: ActivityType.MORNING_ROUTINE,
    description: '洗漱，喝水，简单活动身体。',
    subTasks: [
      { id: '1-1', text: '喝一杯温水', completed: false },
      { id: '1-2', text: '简单拉伸', completed: false }
    ]
  },
  {
    id: '2',
    timeRange: '05:40 - 06:10',
    title: '早餐 & 每日规划',
    type: ActivityType.MORNING_ROUTINE,
    description: '踏实吃早餐，写下今日最重要的3件事。',
    subTasks: [
      { id: '2-1', text: '吃一顿营养早餐', completed: false },
      { id: '2-2', text: '确认今日Top 3任务', completed: false }
    ]
  },
  {
    id: '3',
    timeRange: '06:10 - 07:10',
    title: '轻量预热',
    type: ActivityType.DEEP_WORK,
    description: '梳理用户管理模块数据结构，避免写重代码。',
    subTasks: [
      { id: '3-1', text: '梳理角色权限逻辑', completed: false },
      { id: '3-2', text: '查看API文档大纲', completed: false }
    ]
  },
  {
    id: '4',
    timeRange: '07:10 - 08:00',
    title: '出勤准备',
    type: ActivityType.FIELD_WORK,
    description: '检查设备，整理清单，换工装。',
    subTasks: [
      { id: '4-1', text: '检查无人机 & 电池', completed: false },
      { id: '4-2', text: '带上安全帽 & 检测报告', completed: false },
      { id: '4-3', text: '写好现场验收Checklist', completed: false }
    ]
  },
  {
    id: '5',
    timeRange: '08:00 - 09:00',
    title: '通勤 (开车)',
    type: ActivityType.TRANSIT,
    description: '安全驾驶。语音记录系统优化灵感。',
    subTasks: [
      { id: '5-1', text: '安全抵达现场', completed: false }
    ]
  },
  {
    id: '6',
    timeRange: '09:00 - 11:00',
    title: '现场验收 (桥梁/智慧检测)',
    type: ActivityType.FIELD_WORK,
    description: '按清单核对。记录数据库字段候选，记录流程痛点。',
    subTasks: [
      { id: '6-1', text: '逐项核对验收清单', completed: false },
      { id: '6-2', text: '记录需上传的关键数据字段', completed: false },
      { id: '6-3', text: '记录无人机操作易错点', completed: false }
    ]
  },
  {
    id: '7',
    timeRange: '11:00 - 12:00',
    title: '收尾 & 返程',
    type: ActivityType.TRANSIT,
    description: '现场收尾，午餐，返回。',
    subTasks: [
      { id: '7-1', text: '设备回收清点', completed: false },
      { id: '7-2', text: '午餐休息', completed: false }
    ]
  },
  {
    id: '8',
    timeRange: '14:00 - 17:00',
    title: '深度开发 (平台系统)',
    type: ActivityType.DEEP_WORK,
    description: '无人机管理系统 - 用户管理模块开发。',
    subTasks: [
      { id: '8-1', text: '14:00 复盘现场需求 (3-5条)', completed: false },
      { id: '8-2', text: '14:20 开发用户表 & 注册接口', completed: false },
      { id: '8-3', text: '15:30 休息10分钟 (护眼)', completed: false },
      { id: '8-4', text: '16:30 自测 & 整理明日待办', completed: false }
    ]
  },
  {
    id: '9',
    timeRange: '17:30 - 18:00',
    title: '健康充电 (哑铃)',
    type: ActivityType.HEALTH,
    description: '2-3个动作，每组3次，共20分钟。',
    subTasks: [
      { id: '9-1', text: '完成今日训练组数', completed: false }
    ]
  },
  {
    id: '10',
    timeRange: '19:00 - 22:00',
    title: 'API 学习 & 实战',
    type: ActivityType.LEARNING,
    description: 'HTTP基础，RESTful，写Demo。',
    subTasks: [
      { id: '10-1', text: '19:00 学习API基础概念', completed: false },
      { id: '10-2', text: '20:00 编写后端调用Demo', completed: false },
      { id: '10-3', text: '21:30 复盘 & 写明早第一件事', completed: false }
    ]
  },
  {
    id: '11',
    timeRange: '22:00 - End',
    title: '关机 & 休息',
    type: ActivityType.HEALTH,
    description: '远离屏幕，准备入睡。',
    subTasks: [
      { id: '11-1', text: '手机静音/远离床头', completed: false }
    ]
  }
];