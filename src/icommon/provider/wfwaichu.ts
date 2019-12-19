import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { ENV } from "@env/environment";

/**
 * Created by 李梦龙 on 2018/11/13.
 */

@Injectable()
export class WfwaichuServer {
    constructor(private http: HttpClient,) {

    }


    /**
     * 获取自定义流程
     * @param coverAlia 流程别名，如goOutFlow
     */
    getNewWorkFlow(coverAlia) {
        let that = this;
        let promise = new Promise(function(resolve,reject) {
            that.http.get(ENV.httpurl + '/api/wfCorpConfi/queryAliasByCoverAlias/'+coverAlia).subscribe(data=>{
                //判断是否有新流程别名
                let param = !!data['wfAlias'] == false ? coverAlia : data['wfAlias'];
                //end

                that.http.get(ENV.httpurl + '/api/wf/getDefinition/' + param).subscribe(data2=>{
                    delete data2['workflowDefData']['actionArray'];
                    delete data2['workflowDefData']['actions'];
                    resolve(data2['workflowDefData']);
                }, error=> {
                    reject(error);
                });
            });
        });
        return promise;
    }

    /**
     * 选择办理人员流程
     */
    getProple() {
        //判断弹还是不弹

            //弹的话，人数限制
                //人数验证通过后，先提交表单，再提交班里人
        
        //不弹就直接提交
    }
}