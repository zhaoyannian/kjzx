import { NativeService } from './../../../../icommon/provider/native';
import { FileService } from './../../../../icommon/provider/FileService';
import { Component, ViewChild } from '@angular/core';
import { Events, IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { Camera } from '@ionic-native/camera';
declare var AlloyCrop;
declare var AlloyFinger;
declare var plus;
/**
 * Generated class for the InforEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-infor-edit',
  templateUrl: 'infor-edit.html',
})
export class InforEditPage {
  userinforList: any;
  httpurl: any = {};
  imgsrc: any;
  avatarPath: any;
  base64Image: any;
  crop: boolean = false;
  crop_circle_btn: any;
  crop_result: any;
  @ViewChild('uploadImg') uploadImg: any;
  constructor(public events: Events, public actionSheetCtrl: ActionSheetController, public navCtrl: NavController, public navParams: NavParams, public FileService: FileService,
    public nativeService: NativeService, public http: HttpClient, private camera: Camera, ) {
    this.userinforList = JSON.parse(localStorage.getItem("objectList"));
    this.httpurl = ENV.httpurl;
    localStorage.setItem("file",'111');
    this.crop_circle_btn = document.querySelector("#crop_circle_btn");
    this.crop_result = document.querySelector("#crop_result");
  }

  ionViewDidLoad() {
  }
  // 拍照
  captureImage(){
    var cmr = plus.camera.getCamera();
    var res = cmr.supportedImageResolutions[0];
    var fmt = cmr.supportedImageFormats[0];
    console.log("Resolution: "+res+", Format: "+fmt);
    cmr.captureImage( function( path ){
        alert( "Capture image success: " + path );  
      },
      function( error ) {
        alert( "Capture image failed: " + error.message );
      },
      {resolution:res,format:fmt}
    );
  }
  more() {
    const actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: '相册',
          handler: () => {
            this.getPicture(0);
          }
        }, {
          text: '相机',
          handler: () => {
            this.getPicture(1);
          }
        }, {
          text: '取消',
          role: '取消',
          handler: () => {
          }
        }
      ]
    });
    actionSheet.present();
  }
  getPicture(type) {
    if (type == 0) { // 从相册选一张
      let options = {
        // destinationType: this.camera.DestinationType.FILE_URI
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.PNG,
        mediaType: this.camera.MediaType.PICTURE,
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      };
      this.nativeService.getPicture(options).subscribe(fileUrl => {
        this.saveAvatar(fileUrl);
      });
    }
    if (type == 1) { // 拍一张照片
      let options = {
        sourceType: this.camera.PictureSourceType.CAMERA,
        destinationType: this.camera.DestinationType.DATA_URL
      };
      this.nativeService.getPicture(options).subscribe(fileUrl => {
        this.saveAvatar(fileUrl);
      });
    }
  }
  save() {
    let crop_circle_btn = document.querySelector("#crop_circle_btn");
    let crop_result = document.querySelector("#crop_result");
    new AlloyFinger(crop_circle_btn, {
      tap: function () {
        new AlloyCrop({
          image_src: 'http://pic31.nipic.com/20130722/9252150_095713523386_2.jpg',
          circle: true,
          width: 200,
          height: 200,
          output: 1,
          ok: function (base64, canvas) {
            crop_result.
              appendChild(canvas);
            crop_result.querySelector("canvas").style.borderRadius = "50%";
          },
          cancel: function () {
          },
          ok_text: '确定', // optional parameters , the default value is ok
          cancel_text: '取消' // optional parameters , the default value is cancel
        })
      }
    })
  }
  // private getPictureSuccess(fileUrl) {
  //   new AlloyCrop({ // api:https://github.com/AlloyTeam/AlloyCrop
  //     image_src: fileUrl,
  //     circle: false, // optional parameters , the default value is false
  //     width: 256, // crop width
  //     height: 256, // crop height
  //     output: 1,
  //     ok: (base64) => {
  //       this.crop=true;
  //       this.saveAvatar([base64]);
  //     },
  //     cancel: () => {
  //     },
  //     ok_text: '确定', // optional parameters , the default value is ok
  //     cancel_text: '取消' // optional parameters , the default value is cancel
  //   });

  // }
  saveAvatar(base64) {
    const fileObj = { 'base64': base64 };
    this.nativeService.showLoading();
    this.FileService.uploadByBase64(fileObj).subscribe(fileObj => { // 上传头像图片到文件服务器
      let fileCropurl = this.httpurl + '/api/fileinfo/downloadFile/' + fileObj.id

      this.userinforList = JSON.parse(localStorage.getItem("objectList"));
      this.userinforList.staff.photo = fileObj.id;
      localStorage.setItem("objectList", JSON.stringify(this.userinforList));
      this.nativeService.hideLoading();
      if (this.crop) {
        this.nativeService.showToast("修改成功").then(() => {
          setTimeout(() => {
            this.navCtrl.pop()
          }, 800)
        })
      } else {
        this.crop2(fileCropurl);
      }
    });
  }

  //裁剪方法 -- 修改
  crop2(fileCropurl) {
    this.navCtrl.push('CropImagePage', { imageSrc: fileCropurl }).then(() => {
      this.events.subscribe('crop-image:result', imgBase64Str => {
        this.crop = true;
        this.saveAvatar(imgBase64Str);
      });
    });
  }
}
