import { NgModule, ErrorHandler } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { IonicApp, IonicModule } from "ionic-angular";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { MyApp } from "./app.component";

import { ContactPage } from "../pages/ischedule/contact/contact";
import { HomePage } from "../pages/ihome/home/home";
import { MinePage } from "../pages/icontacts/mine/mine";
import { TabsPage } from "../pages/tabs/tabs";
import { LoginPage } from "../pages/login/login";
import { ScreenOrientation } from "@ionic-native/screen-orientation";
import { SelectMeetingPage } from "../pages/imeeting/meetings/editor/selectMeeting";
import { SelectPersonPage } from "../pages/imeeting/meetings/editor/selectPerson";
import { DeletePersonPage } from "../pages/imeeting/meetings/editor/deletePerson";
import { EditorViewPage } from "../pages/imeeting/meetings/editor/editorView";
import { MinecontactPage } from "../pages/icontacts/mine/minecontact/minecontact";
import { MinedeptPage } from "../pages/icontacts/minedept/minedept";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { WorkhoursPageModule } from "../pages/ihome/workhours/workhours.module";
import { CalendarPageModule } from "../pages/ischedule/calendar/calendar.module";
import { InterceptorService } from "../icommon/provider/InterceptorService";
import { globalData } from "../icommon/provider/globalData";
import { zyglobalData } from "../icommon/provider/zyglobalData";
import { HttpModule } from "@angular/http";
import { FormsModule } from "@angular/forms";
import { Toast } from "@ionic-native/toast";
import { NativeService } from "../icommon/provider/native";
import { CalendarModule } from "ion2-calendar";
import { DatePickerModule } from "ionic3-datepicker";
import { MeetingsPageModule } from "../pages/imeeting/meetings/meetings.module";
import { NewSchedulePageModule } from "../pages/ischedule/contact/new-schedule/new-schedule.module";
import { SchedulePageModule } from "../pages/ischedule/calendar/newSchedule/newSchedule.module";
import { GroupCalPage } from "../pages/ischedule/calendar/groupCal/groupCal";
import { MoreListPage } from "../pages/ischedule/calendar/moreList/moreList";
import { TodoListPage } from "../pages/ihome/home/todoList/todoList";
import { YlListPage } from "../pages/ihome/home/ylList/ylList";
import { EditorApproPage } from "../pages/imeeting/meetings/meetAppro/editorAppro";
import { PopoverPage } from "../pages/ischedule/contact/popover";
import { RecallPopoverPage } from "../components/icomponents/recallPopover/recallPopover";
import { MessagePublishPageModule } from "../pages/ihome/messagePublish/messagePublish.module";
import { MineviewPageModule } from "../pages/icontacts/mineview/mineview.module";
import { Camera } from "@ionic-native/camera";
import { File } from "@ionic-native/file";
import { FileTransfer } from "@ionic-native/file-transfer";
import { ImagePicker } from "@ionic-native/image-picker";
import { FileService } from "../icommon/provider/FileService";
import { WaichuPageModule } from "../pages/ihome/waichu/waichu.module";
import { DatePipe } from "@angular/common";
import { SettingPageModule } from "../pages/imine/setting/setting.module";
import { InformationPageModule } from "../pages/imine/setting/information/information.module";
import { WfwaichuServer } from "../icommon/provider/wfwaichu";
import { MeetApproPage } from "../pages/imeeting/meetings/meetAppro/meetAppro";
import { MeetInfoViewPage } from "../pages/imeeting/meetings/meetView/meetView";
import { CreateGroupPage } from "../pages/ischedule/calendar/groupCal/createGroup/createGroup";
import { GroupListPage } from "../pages/ischedule/calendar/groupCal/groupList/groupList";
import { NewsModule } from "../pages/ihome/home/newsList/news.module";
import { AppUpdate } from "@ionic-native/app-update";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { AppVersion } from "@ionic-native/app-version";
import { Network } from "@ionic-native/network";
import { BackButtonService } from "../icommon/provider/backButton.service";
import { WelcomePage } from "../pages/welcome/welcome";
import { IonicStorageModule } from "@ionic/storage";
import { MyErrorHandler } from "../icommon/provider/MyErrorHandler";
import { JPush } from "@jiguang-ionic/jpush";
import { Keyboard } from "@ionic-native/keyboard";
import { Helper } from "../icommon/provider/jpush";
// import { Media } from '@ionic-native/media';
// import { StreamingMedia } from '@ionic-native/streaming-media';
import { AlphaListModule } from "../icommon/modules/index";
import { PipesModule } from "../icommon/pipes/pipes.module";
import { AppMinimize } from "@ionic-native/app-minimize";
import { QRScanner } from "@ionic-native/qr-scanner";

import { IstaffadvisePage } from "../pages/istaffadvise/istaffadvise";
import { IstaffadviseSlide1Page } from "../pages/istaffadvise/istaffadvise-slide1/istaffadvise-slide1";
import { IstaffadviseSlide2Page } from "../pages/istaffadvise/istaffadvise-slide2/istaffadvise-slide2";
import { IstaffadviseSlide3Page } from "../pages/istaffadvise/istaffadvise-slide3/istaffadvise-slide3";
import { IstaffadviseSlide4Page } from "../pages/istaffadvise/istaffadvise-slide4/istaffadvise-slide4";
import { SelectDeptPage } from "../pages/istaffadvise/istaffadvise-detail/select-dept";
import { SelectAdvisePersonPage } from "../pages/istaffadvise/istaffadvise-detail/selectPerson";
import { SelectAdvisePage } from "../pages/istaffadvise/istaffadvise-detail/select-advise";

@NgModule({
  declarations: [
    WelcomePage,
    MyApp,
    ContactPage,
    HomePage,
    TabsPage,
    MinePage,
    LoginPage,
    TodoListPage,
    YlListPage,
    EditorApproPage,
    MeetApproPage,
    MeetInfoViewPage,
    CreateGroupPage,
    GroupListPage,
    SelectMeetingPage,
    SelectPersonPage,
    DeletePersonPage,
    EditorViewPage,
    GroupCalPage,
    MoreListPage,
    PopoverPage,
    RecallPopoverPage,
    MinecontactPage,
    MinedeptPage,
    IstaffadvisePage,
    IstaffadviseSlide1Page,
    IstaffadviseSlide2Page,
    IstaffadviseSlide3Page,
    IstaffadviseSlide4Page,
    SelectDeptPage,
    SelectAdvisePersonPage,
    SelectAdvisePage
  ],
  imports: [
    BrowserModule,
    WorkhoursPageModule, //工时填报
    AlphaListModule,
    PipesModule,
    CalendarPageModule,
    HttpModule,
    FormsModule,
    HttpClientModule,
    NewsModule, //新闻
    SettingPageModule, //首页用户信息菜单
    InformationPageModule,
    CalendarModule,
    SchedulePageModule,
    NewSchedulePageModule,
    MessagePublishPageModule,
    DatePickerModule,
    MeetingsPageModule, //会议
    MineviewPageModule,
    WaichuPageModule, //外出报备

    IonicModule.forRoot(MyApp, {
      /*进入子页面后隐藏tabs菜单配置*/
      tabsHideOnSubPages: "true",
      mode: "ios",
      /* 修改页面返回按钮文本信息*/
      backButtonText: ""
    }),
    IonicStorageModule.forRoot() //配合引导页
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    WelcomePage,
    MyApp,
    ContactPage,
    HomePage,
    TabsPage,
    MinePage,
    LoginPage,
    IstaffadvisePage,
    TodoListPage,
    YlListPage,
    EditorApproPage,
    MeetApproPage,
    MeetInfoViewPage,
    CreateGroupPage,
    GroupListPage,
    SelectMeetingPage,
    SelectPersonPage,
    DeletePersonPage,
    SelectDeptPage,
    SelectAdvisePersonPage,
    SelectAdvisePage,
    EditorViewPage,
    GroupCalPage,
    MoreListPage,
    PopoverPage,
    RecallPopoverPage,
    MinecontactPage,
    MinedeptPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    globalData,
    zyglobalData,
    NativeService,
    FileService,
    Camera,
    File,
    FileTransfer,
    ImagePicker,
    Toast,
    DatePipe,
    Network,
    WfwaichuServer, //外出报备流程
    ScreenOrientation, //竖屏
    AppUpdate, //android更新
    BackButtonService, //android物理返回键
    InAppBrowser, //在APP内打开浏览器
    Keyboard,
    // Media,
    // StreamingMedia,
    AppVersion, //获取应用版本
    AppMinimize,
    Helper, //极光伴侣
    JPush, //极光
    QRScanner,
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true }
    // {provide: ErrorHandler, useClass: IonicErrorHandler}
    // {provide: ErrorHandler, useClass: MyErrorHandler}
  ]
})
export class AppModule {}
