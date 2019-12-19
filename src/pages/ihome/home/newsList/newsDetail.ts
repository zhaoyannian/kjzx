import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
// import { Media, MediaObject } from '@ionic-native/media';
import { DomSanitizer } from '@angular/platform-browser'; // 引入DomSanitizer服务
import { HttpClient } from '@angular/common/http'
import { ENV } from '@env/environment';
import 'rxjs';
// import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media';
// declare var Media
import _ from 'lodash';
//@IonicPage()
@Component({
  selector: 'page-newsDetail',
  templateUrl: 'newsDetail.html',
})
export class NewsDetailPage {

  newEntity: any;
  filreList: any;
  httpurl: any= ENV.httpurl;;
  filreLength: any;
  type: any;
  title: any;
  MediaObject:any;
  videourl:any;
  constructor(private sanitizer: DomSanitizer,public navCtrl: NavController, public navParams: NavParams, public http: HttpClient) {
    this.newEntity = this.navParams.get("entity");
    this.type = this.navParams.get("type");
    this.title = this.navParams.get("title");
    if (!!this.newEntity.filesId) {
        this.http.get(ENV.httpurl + "/api/fileinfo/queryFileList/" + this.newEntity.filesId).subscribe(data => {
          if (data['length'] > 0) {
            this.filreList = data;
            this.filreLength = data['length'];
            if(this.type == 'video'){
              _.map(this.filreList ,n=>{
                 n.videourl = this.httpurl+'/stoneVfs/local/'+n.uploadUrl
              })
              // this.videourl = this.sanitizer.bypassSecurityTrustUrl(this.httpurl+'/api/fileinfo/dlFile/'+this.filreList[0].id)
              // let options: StreamingVideoOptions = {
              //   successCallback: () => { console.log('Video played') },
              //   errorCallback: (e) => { console.log('Error streaming') },
              //   orientation: 'landscape',
              //   shouldAutoClose: true,
              //   controls: false
              // };
              // this.streamingMedia.playVideo('http://static.videogular.com/assets/videos/videogular.mp4', options);
            }
          }
        })
       
      // if (this.type === 'video') {
      //   _.map(this.newEntity.filesId.split(","), (fileId) => {
      //     if (!!fileId) {
      //       this.http.get(ENV.httpurl + '/api/fileinfo/dlFile/' + fileId).subscribe(data => {
      //         data);
      //       })
      //       this.vedioUrls.push(ENV.httpurl + '/api/fileinfo/dlFile/' + fileId);
      //     }
      //   });
      // }
    }
    
  
    
  }
  goback(){
    this.navCtrl.pop();
  }
  

}
