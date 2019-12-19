/**
 * Created by shenqingqing on 2018/11/7.
 */
// import { stateNameWithParent } from './utils';
export const IMAGE_SIZE = 1024; // 拍照/从相册选择照片压缩大小
export const QUALITY_SIZE = 94; // 图像压缩质量，范围为0 - 100
/******************** 通用api ********************/
export const getWfInfoUri = '/api/wf/getDefinition'; // 获取流程定义信息
export const getWfInstUri = '/api/wf/getWorkflowInst';// 获取流程实例信息
export const querySelectResourceListUri = '/api/wf/querySelectResourceList';//启动流程前获取第二环节资源列表
export const startWfInstUri = '/api/wf/startWorkflowInst';//启动一个流程
export const querySelectResourceListOfInstUri = '/api/wf/querySelectResourceListOfInst';//获取流程实例下一环节资源列表
export const actionUri = '/api/wf/handleWorkflowInst';// 通用提交、办结、退回、终止接口
/******************** 通用api ********************/

/******************** 工时填报 ********************/
export const wfAlias = 'ProjectDaily'; // 流程的别名或者id
export const queryListUri = '/api/projectDaily/queryList';// 通过主键id列表查询业务表
export const queryListByPageUri = '/api/projectDaily/queryPd';// 业务分页查询实体列表
export const deleteUri = '/api/projectDaily/deleteEntity';//删除
export const entryUri = '/api/projectDaily/queryEntity';// 查询单个业务实体
export const queryStaffsUri = '/api/staff/queryStaffsInUserIds';//查询人员信息
export const queryDeptsUri = '/api/dept/queryListByDeptIds';//查询部门信息
export const saveEntityUri = '/api/projectDaily/saveOrUpdate';// 保存业务实体
export const myNotifyUri = '/api/wf/myNotifyApp';
// export const myNotifyUri = '/api/wf/myNotifyAppNew';//master分支


/******************** 工时填报 ********************/

/******************** 请假申请 ********************/
export const wfAlias2 = 'QITAJIA';// 流程的别名或者id
// export const stateFullName = stateNameWithParent(stateName, parentState);
export const queryNewAliasUri = '/api/leaveApply/queryAliasByCoverAlias/';
export const queryAllAliasUri = '/api/leaveApply/queryAliasList';
// export const queryListByPageUri2 = "/api/leaveApply/queryBySearchStatusArr";// 业务分页查询实体列表
export const queryListByPageUri2 = "/api/leaveApply/queryPd";
export const entryUri2 = '/api/leaveApply/queryEntity';// 查询单个业务实体
export const saveEntityUri2 = '/api/leaveApply/saveOrUpdate';// 保存业务实体
export const queryListUri2 = '/api/leaveApply/queryList';// 通过主键id列表查询业务表
export const deleteUri2 = '/api/leaveApply/deleteEntity';//删除
export const queryFlowByTypeUri = '/api/leaveApply/queryFlowAsName';//查询请假流程
export const queryYearDaysByUserIdUri = '/api/leaveApply/queryAnnualDays';//查询年假天数
export const queryControlDaysUri = '/api/leaveApply/queryApplyRule';//查询请假天数控制
export const queryListFileUri = '/api/fileinfo/queryFileList';//查询附件信息
export const downloadFileUri = '/api/fileinfo/downloadFile';//下载附件
// export const uploadFileUri = '/base/fileinfo/uploadFile';
export const uploadFileUri = '/apiApp/fileinfoApp/uploadFileApp';
 
/******************** 请假申请 ********************/


/******************** 印章申请-开始 ********************/
export const wfAlias3 = 'SealApply';// 流程的别名或者id
export const queryAllAliasUri3 = '/api/SealApply/queryAliasList';
export const queryListByPageUri3 = "/api/SealApply/queryPd";
export const entryUri3 = '/api/SealApply/queryEntity';// 查询单个业务实体
export const queryListUri3 = '/api/SealApply/queryList';// 通过主键id列表查询业务表
export const deleteUri3 = '/api/SealApply/deleteEntity';//删除
export const createApplyNoUri='/api/SealApply/createApplyNo'; //生成编号
export var saveEntityUri3 = '/api/SealApply/saveOrUpdate';
export const sealSearchdb = '/api/SealApply/queryPdsealPage';
export const sealSearchyb = '/api/SealApply/queryPdsealUntriedPage';
/******************** 印章申请-结束 ********************/

/******************** 身份卡管理-开始 ********************/
export const wfAlias4 = 'ICCard';// 流程的别名或者id
export const queryAllAliasUri4 = '/api/iccard/queryAliasList';
export const queryListByPageUri4 = "/api/iccard/queryPd";
export const queryListUri4 = '/api/iccard/queryList';// 通过主键id列表查询业务表
export const deleteUri4 = '/api/iccard/deleteEntity';//删除
export const saveEntityUri4 ='/api/iccard/saveOrUpdate';
export const entryUri4 = '/api/iccard/queryEntity';// 查询单个业务实体
export const icardSearchdb = '/api/iccard/queryByICCard';
export const icardSearchyb = '/api/iccard/queryByYBICCard';
/******************** 身份卡管理-结束 ********************/

/******************** 网络资源管理-开始 ********************/
export const wfAlias5 = 'networkResource';// 流程的别名或者id
export const wfAlia5 = 'networkResource2';
export const queryListByPageUri5 = "/api/networkResource/queryPd";
export const queryListUri5 = '/api/networkResource/queryList';// 通过主键id列表查询业务表
export const deleteUri5 = '/api/networkResource/deleteEntity';//删除
export const saveEntityUri5 ='/api/networkResource/saveOrUpdate';
export const entryUri5 = '/api/networkResource/queryEntity';// 查询单个业务实体
export const networkSearchdb = '/api/networkResource/queryByDBnetwork';
export const networkSearchyb = '/api/networkResource/queryByYBnetwork';
/******************** 网络资源管理-结束 ********************/

/******************** 外出报备-开始 ********************/
export const wfAlias6 = 'goOutFlow';// 流程的别名或者id
export const queryListByPageUri6 = "/api/goOut/queryPd";
export const queryListUri6 = '/api/goOut/queryList';// 通过主键id列表查询业务表
export const deleteUri6 = '/api/goOut/deleteEntity';//删除
export const saveEntityUri6 ='/api/goOut/saveOrUpdate';
export const entryUri6 = '/api/goOut/queryEntity';// 查询单个业务实体
/******************** 外出报备-结束 ********************/

/******************** 事项文件-开始 ********************/
export const wfAlias7 = 'ItemFile';// 流程的别名或者id
export const queryListByPageUri7 = "/api/itemfile/queryPd";
export const queryListUri7 = '/api/itemfile/queryList';// 通过主键id列表查询业务表
export const deleteUri7 = '/api/itemfile/deleteEntity';//删除
export const saveEntityUri7 ='/api/itemfile/saveOrUpdate';
export const entryUri7 = '/api/itemfile/queryEntity';// 查询单个业务实体
/******************** 事项文件-结束 ********************/

/******************** 出差申请-开始 ********************/
export const wfAlias8 = 'evection';// 流程的别名或者id
export const queryListByPageUri8 = "/api/evectionApply/queryPd";
export const queryListUri8 = '/api/evectionApply/queryList';// 通过主键id列表查询业务表
export const deleteUri8 = '/api/evectionApply/deleteEntity';//删除
export const saveEntityUri8 ='/api/evectionApply/saveOrUpdate';
export const entryUri8 = '/api/evectionApply/queryEntity';// 查询单个业务实体
/******************** 出差申请-结束 ********************/

/******************** 用车申请-开始 ********************/
export const wfAlias9 = 'ReserveCarWF';// 流程的别名或者id
export const queryListByPageUri9 = "/api/ReserveCar/queryPd";
export const queryListUri9 = '/api/ReserveCar/queryList';// 通过主键id列表查询业务表
export const deleteUri9 = '/api/ReserveCar/deleteEntity';//删除
export const saveEntityUri9 ='/api/ReserveCar/saveOrUpdate';
export const entryUri9 = '/api/ReserveCar/queryEntity';// 查询单个业务实体
/******************** 用车申请-结束 ********************/

/******************** 网络服务管理-开始 ********************/
export const wfAlias10 = 'webService';// 流程的别名或者id
export const queryListByPageUri10 = "/api/networkService/queryPd";
export const queryListUri10 = '/api/networkService/queryList';// 通过主键id列表查询业务表
export const deleteUri10 = '/api/networkService/deleteEntity';//删除
export const saveEntityUri10 ='/api/networkService/saveOrUpdate';
export const entryUri10 = '/api/networkService/queryEntity';// 查询单个业务实体
export const netSearchdb = '/api/networkService/queryByDBnetwork';
export const netSearchyb = '/api/networkService/queryByYBnetwork';
/******************** 网络资源管理-结束 ********************/

export const staffClzName = 'com.stonewomb.common.entity.Staff';
// export const staffClzName = 'com.stonewomb.common.auth.entity.Staff';//master分支
export const dictOptionClzName = 'com.stonewomb.common.entity.DictOption';
// export const dictOptionClzName = 'com.stonewomb.common.extral.entity.DictOption';//master分支
export const staffIndex = 'userId';

export function uuid () {
    function s4() {
       return Math.floor((1 + Math.random()) * 0x10000)
         .toString(16)
         .substring(1);
     }
     return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
       s4() + '-' + s4() + s4() + s4();
  }
  