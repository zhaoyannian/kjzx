export const readIcaFlowUri = '/api/instrumentContractApply/queryListApp';
export const readMcFlowUri = '/api/materialContract/queryListApp';
export const readEquPurFlowUri = '/api/equPurApplication/queryListApp';
export const entrustApplyFlowUri = '/api/entrustApply/queryListApp';
export const readCompoFlowUri = '/api/componentsPurAppli/queryListApp';
//下拉框的值
export const opionsUri = '/api/dictOption/getListByDictCode';

// 获取流程环节信息列表
export const handleUri = '/api/flowPointInfo/getcurFlowPointInfo';
export const handleNewUri = '/api/equPurApplication/queryEntityAndFlowInfo';

// 获取流程环节信息列表2
export const handleUri2 = '/api/flowPointInfo/getcurFlowPointInfo';
export const handleNewUri2 = '/api/instrumentContractApply/queryEntityAndFlowInfo';

// 获取流程环节信息列表3
export const handleUri3 = '/api/flowPointInfo/getcurFlowPointInfo';
export const handleNewUri3 = '/api/componentsPurAppli/queryEntityAndFlowInfo';
export const getAmountConfigUri3 = '/api/amountSegmentConfig/queryEntityByType/componentsPurAppli';
export const detailReadUri = '/api/componentsPurAppliDetail/queryEntityByParentId';

// 获取流程环节信息列表5
export const handleUri5 = '/api/flowPointInfo/getcurFlowPointInfo';
export const handleNewUri5 = '/api/materialContract/queryEntityAndFlowInfo';

// 获取流程环节信息列表6
export const handleUri6 = '/api/flowPointInfo/getcurFlowPointInfo';
export const handleNewUri6 = '/api/entrustApply/queryEntityAndFlowInfo';



//流程办理
export const readFlowOpinionUri = '/api/flowPointInfo/getAllflowOpinionByDataId';
export const readPointInfoUri = '/api/flowPointInfo/getAllFlowPointInfo';
export const readButtonUri = '/api/flowPointInfo/getButtonInfo';
export const readDefaultOpinionUri = '/service/...!getDefaultOpinion';
//默认显示最大环节数
export const defaultDisplayPoint = 7;

export const fileSearchUri = '/stoneVfs/local/';

//采购申请
export const getDirectDeptStaffsUri = '/api/organization/queryStaffsByOrgId/';
export const createUri = '/api/equPurApplication/saveEntity';

export const createUri3 = '/api/componentsPurAppli/saveEntity';
export const createUri2 = '/api/instrumentContractApply/saveEntity';
export const createUri5 = '/api/materialContract/saveEntity';
export const createUri6 = '/api/entrustApply/saveEntity';

export const getMaxCodeUri = '/api/equPurApplication/getMaxCode';
// 元器件采购
export const getMaxCodeUri3 = '/api/componentsPurAppli/getMaxCode';
export const getMaxCodeUri4 = '/api/materialContract/getMaxCode'; 
//委托申请采购
export const getMaxCodeUri6 = '/api/entrustApply/getMaxCode';

export const updateUri = '/api/equPurApplication/updateEntity';

// 默认部门选择
export const roleIdOne = '6704ce2d5a6f4f258a95bfc0f9bfb50c'; // 主管部门项目管理员
export const roleIdTwo = 'b200e13b69af4e5899c9f27229fff132'; // 分管业务中心所领导

export const roleStaffUri = '/api/bicRole/queryStaffByRoleId/'; // 根据角色id查询人员

// 暂存1
export const temporaryUri = '/api/equPurApplication/flowTemporary';
// 暂存2
export const temporaryUri2 = '/api/instrumentContractApply/flowTemporary';
// 暂存3
export const temporaryUri3 = '/api/componentsPurAppli/flowTemporary';

// 暂存、提交(复杂提交)
export const temporaryUri5 = '/api/materialContract/flowTemporary';

export const temporaryUri6 = '/api/entrustApply/flowTemporary';

export const wfSigntureUri = '/stoneVfs/local';

export const purchaseWayStatuss = {
    Inquiry_To_Purchase: '询价采购',
    Online_Bidding_Space_Center: '空间中心网上竞价',
    Single_Source_Purchase: '单一来源采购',
    Competitive_Consultation: '竞争性磋商',
    Central_Bidding_On_Net: '央采网网上竞价',
    Self_Order_below_20000: '自行订货(2万以下)',
    Public_Bidding: '公开招标',
    Invitation_Bidding: '邀请招标',
    Competitive_Negotiation: '竞争性谈判',
    Protocol_Supply: '协议供货',
    Other: '其他',
    Batch_Centralized_Purchasing: '批量集中采购',
    Sentinel_Purchase: '定点采购',
    PublicBidding: '公开招标',
    Shopping: '询价采购',
    InvitePublicBidding: '邀请招标',
    CompetitiveNegotiation: '竞争性谈判',
    SingleSourceProcurement: '单一来源采购',
    Competitive_Cs: '竞争性磋商',
    BulkCentralizedPurchasing: '批量集中采购',
    FixedPurchase: '定点采购',
    AgreementSupply: '协议供货',
    OnlineAuction_Yc: '央采网网上竞价',
    OnlineAuction_Kj: '空间中心网上竞价',
    SelfOrder: '自行订货(2万以下)'
};
export const getAmountConfigUri = '/api/amountSegmentConfig/queryEntityByType/equPurApplication';
export const querySubColumn = 'subjectCode,subjectName';
export const readSubUri = '/api/subjectRelationInfo/queryEntity';

//课题授权信息
export const subAuthorReadUri = "/api/subjectAuthorization/queryEntityAndSubBudgetToAuthor"; //queryEntityToAuthor
export const deleteSubUri = '/api/subjectRelationInfo/deleteByIds';
export const checkSubUri = '/api/subjectRelationInfo/queryEntityByCheckSub';
export const createSubUri = '/api/subjectRelationInfo/saveEntity';
export const updateSubUri = '/api/subjectRelationInfo/updateEntity';

//固定资产设备信息
export const equInfoReadUri = "/api/equInformation/queryEntity";
export const equInfoEntriyUri = "/api/equInformation/findById";
export const equInfoEntriyByCodeUri = "/api/equInformation/findByEquInfoCode";
export const assetsClassEntryByCodeUri = "/api/assetsClassApi/findByCode";
export const queryequInfoColumn = 'assetCode,assetName';

//读取待办仪器设备采购
// queryList =》queryListApp
export const readUri = '/api/equPurApplication/queryListApp';
export const flowDefId = "c6fb53c8959e432fab90f54299e8b99,c6fb53c8959e432fab90f54299e8be8,c6fb53c8959e432fab90f54299e8bc6,c6fb53c8959e432fab90f54299e8bd7,c6fb53c8959e432fab90f54299e8bb5";
export const bizType = 'SCMSB';

//读取待办仪器设备合同
export const readUri2 = '/api/instrumentContractApply/queryListApp';
export const queryColumn = 'id,caCode,applicant,applicationDate,contractName';
export const bizType2 = 'SCMHT';

//读取待办项目委托申请
export const readUri6 = '/api/entrustApply/queryListApp';
// export const queryColumn = 'id,caCode,applicant,applicationDate,contractName';
//export const flowDefId6 = '92722873e40e43779ac03320dc4b4deb';
//export const flowDefId6 = 'c4d4aa974fa04476b1e2000c9902aacb';
export const flowDefId6 = '561f22500e60449abd45b5c449142e96';

export const bizType6 = 'SCMWT';
//付款信息
export const payReadUri = '/api/payMent/queryEntity';
//交货信息
export const deliveryReadUri = '/api/deliveryPlan/queryEntity';
export const flowDefId2 = 'bd79f11a426a4aa1801ee9fd090ea2cf,c6fb53c8959e432fab90f54299e8ba56,c6fb53c8959e432fab90f54299e8ba42,c6fb53c8959e432fab90f54299e8ba49,c6fb53c8959e432fab90f54299e8ba43,c6fb53c8959e432fab90f54299e8ba44,b766acaabb354750bb1c8b55840b5488,111e37d52236495ead39f611e75607b5,92f5ecec10134caeb48032e9fe20dfd9,d2704da8be474f90a77b22a5dbfcd066,ea3f35356cd34aff9e27d67363849ae7';

//读取待办元器件设备采购
export const readUri3 = '/api/componentsPurAppli/queryListApp';
export const bizType3 = 'SCMCOMPO';
export const flowDefId3 = "c6fb53c8959e432fab90f54299e8111,c6fb53c8959e432fab90f54299e8112,c6fb53c8959e432fab90f54299e8113,c6fb53c8959e432fab90f54299e8114,c6fb53c8959e432fab90f54299e8115";

//读取待办元器件合同
export const bizType4 = 'SCMMCHT';
export const flowDefId4 = 'bd79f11a426a4aa1801ee9fd090ea2fd,c6fb53c8959e432fab90f54299e8ba11,c6fb53c8959e432fab90f54299e8ba12,c6fb53c8959e432fab90f54299e8ba13,c6fb53c8959e432fab90f54299e8ba14,c6fb53c8959e432fab90f54299e8ba15,b766acaabb354750bb1c8b55840b5416,111e37d52236495ead39f611e7560717,92f5ecec10134caeb48032e9fe20df18,d2704da8be474f90a77b22a5dbfcd019,ea3f35356cd34aff9e27d67363849a20';
export const readUri4 = '/api/materialContract/queryListApp';
export const queryColumn4 = 'id,caCode,applicant,applicationDate,contractName';
//读取待办正样元器件合同
//合同明细
export const contractDetailReadUri = '/api/componentsPurAppliDetail/queryEntityByParentId';
// 仪器设备合同管理
export const flowIcaDefId = [
    'bd79f11a426a4aa1801ee9fd090ea2cf',
    'c6fb53c8959e432fab90f54299e8ba56',
    'c6fb53c8959e432fab90f54299e8ba42',
    'c6fb53c8959e432fab90f54299e8ba49',
    'c6fb53c8959e432fab90f54299e8ba43',
    'c6fb53c8959e432fab90f54299e8ba44',
    'b766acaabb354750bb1c8b55840b5488',
    '111e37d52236495ead39f611e75607b5',
    '92f5ecec10134caeb48032e9fe20dfd9',
    'd2704da8be474f90a77b22a5dbfcd066',
    'ea3f35356cd34aff9e27d67363849ae7'
];

// 元器件材料合同管理
export const flowMcDefId = [
    'bd79f11a426a4aa1801ee9fd090ea2fd',
    'c6fb53c8959e432fab90f54299e8ba11',
    'c6fb53c8959e432fab90f54299e8ba12',
    'c6fb53c8959e432fab90f54299e8ba13',
    'c6fb53c8959e432fab90f54299e8ba14',
    'c6fb53c8959e432fab90f54299e8ba15',
    'b766acaabb354750bb1c8b55840b5416',
    '111e37d52236495ead39f611e7560717',
    '92f5ecec10134caeb48032e9fe20df18',
    'd2704da8be474f90a77b22a5dbfcd019',
    'ea3f35356cd34aff9e27d67363849a20',
];

// 仪器设备采购申请
export const equPurFlowIcaDefId = [
    'c6fb53c8959e432fab90f54299e8b99',
    'c6fb53c8959e432fab90f54299e8be8',
    'c6fb53c8959e432fab90f54299e8bc6',
    'c6fb53c8959e432fab90f54299e8bd7',
    'c6fb53c8959e432fab90f54299e8bb5'
];
// 元器件材料采购申请
export const compoFlowMcDefId = [
    'c6fb53c8959e432fab90f54299e8111',
    'c6fb53c8959e432fab90f54299e8115',
    'c6fb53c8959e432fab90f54299e8113',
    'c6fb53c8959e432fab90f54299e8114',
    'c6fb53c8959e432fab90f54299e8112'
];

// 正样元器件合同管理
export const resuQuDefId = [
    'bd79f11a426a4aa1801ee9fd090ea2fd',
    'c6fb53c8959e432fab90f54299e8ba11',
    'c6fb53c8959e432fab90f54299e8ba12',
    'c6fb53c8959e432fab90f54299e8ba13',
    'c6fb53c8959e432fab90f54299e8ba14',
    'c6fb53c8959e432fab90f54299e8ba15',
    'b766acaabb354750bb1c8b55840b5416',
    '111e37d52236495ead39f611e7560717',
    '92f5ecec10134caeb48032e9fe20df18',
    'd2704da8be474f90a77b22a5dbfcd019',
    'ea3f35356cd34aff9e27d67363849a20'
];


export const entrustApplyId = [
    '561f22500e60449abd45b5c449142e96'
];
// export const entrustApplyId = [
//     '92722873e40e43779ac03320dc4b4deb'
// ];

export const canSkipFlowPointZHB = {
    "name": "综合办流程自动处理环节",
    "deptId": "3.1415926",
    "currentPointName": "主管部门经办人",
    "ignoredPointName": "主管部门负责人",
    "targetPointName": "分管业务中心所领导"
}

export const canSkipFlowPoint = {
    "name": "跳课题负责人",
    "deptIds": ["263", "90", "91"],
    "pointNames": ["课题负责人"]
}
export const autoHandlePoint = {
    "pointTitles": ["分管业务中心所领导", "分管财务中心所领导", "中心主任"]
}