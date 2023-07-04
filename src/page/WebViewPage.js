import React, { useState } from 'react'
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  BackHandler,
  Alert,
  ActivityIndicator,
  TextInput,
  Linking,
  ToastAndroid,
  Dimensions,
  Share
} from 'react-native'
import { API } from '../Utils/API';
import { WebView } from 'react-native-webview'
import SplashScreen from 'react-native-splash-screen'
import { useFocusEffect } from '@react-navigation/native'
import Toast from 'react-native-simple-toast'
import firebase from '@react-native-firebase/app'
import messaging from '@react-native-firebase/messaging'
import PushNotification from 'react-native-push-notification'
import queryString from 'query-string'
import Footer from "../component/Footer";

const WebViewPage = (props) => {
  let { height, width } = Dimensions.get('window')

  //웹작업 토큰이 회원테이블에 있으면 자동로그인 없으면 로그인 페이지로 작업
  //const domain_url = 'dmonster1886.cafe24.com'
  //const domain_url = 'todaydoc.kr'
  //const app_domain = 'https://'+domain_url+'/'
  //const url = app_domain
  const domain_url = 'dmonster1886.cafe24.com'
  const app_domain = 'https://'+domain_url+'/'
  const exit_domain = 'https://'+domain_url+'/login.php?chk_app=Y'
  const url = app_domain + 'auth.php?chk_app=Y&app_token='
  const [webview_url, set_webview_url] = React.useState(url)
  const [urls, set_urls] = React.useState('ss')
  const [webview_load, set_webview_load] = React.useState(false)
  const webViews = React.useRef()
  const [is_loading, set_is_loading] = React.useState(false)
  const { route, navigation } = props

  React.useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide()
    }, 1000)

    //푸시 갯수 초기화
    PushNotification.setApplicationIconBadgeNumber(0)

    //기기토큰 가져오기
    async function requestUserPermission() {
      const authStatus = await messaging().requestPermission()
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL

      await get_token()

      // if (enabled) {
      //     // console.log('Authorization status:', authStatus)
      //     await get_token()
      // } else {
      //     await getInstanceId()
      // }
    }

    async function get_token() {
      await messaging()
        .getToken()
        .then((token) => {
          console.log('token', token)

          if (token) {
            const type = route.params?.type
            const response = route.params?.response

            if (response) {
              const query = queryString.stringify(response)
              if (type === 'payment') {
                const impURL = url + token + '&' + query
                // console.log('impURL ', impURL)
                set_webview_url(impURL)
              }
            } else {
              set_webview_url(url + token)
            }

            return true
          } else {
            return false
          }
        })
    }

    requestUserPermission()

    set_is_loading(true)

  }, [])



  const onWebViewMessage = async (webViews) => {
    let jsonData = JSON.parse(webViews.nativeEvent.data)


    /*
    // 웹뷰에서 RN으로 데이터를 보낼때 사용합니다.
    <button onclick="shareRN('https://naver.com')">Share</button>
    const shareRN = (url) => {
        if (window.ReactNativeWebView) {
            // RN에서 데이터는 반드시 문자열로 받을 수 있기 때문에
            // JSON.stringify를 사용합니다.
            window.ReactNativeWebView.postMessage(
                JSON.stringify( {data:"share", url:url} )
            );
        } else {
            // --
        }
    };
     */
    if(jsonData?.data === 'share') {
      console.log('jsonData : ', jsonData);
      onShare(jsonData.url);
    }

    if (jsonData?.type === 'Payment') {
      navigation.navigate('PaymentPage', {
        ...jsonData.data,
        usercode: jsonData.usercode,
      })
    } else if (jsonData?.type === 'login_kakao') {

    } else if (jsonData?.type === 'login_naver') {

    } else if (jsonData?.type === 'login_facebook') {

    }
  }

  const onShare = async (url) => {
    try {
      const result = await Share.share(
        {
          message: url,
        }
      );

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('activityType!');
        } else {
          console.log('Share!');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('dismissed');
      }
    } catch (error) {
      alert(error.message);
    }
  };


  const onNavigationStateChange = (webViewState) => {
    console.log('onNavigationStateChange : ' + webViewState.url);

    var chk_uri = 'Y'

    if (webViewState.url.includes(domain_url)) {
      chk_uri = 'N'
    }
    if (webViewState.url.includes('wauth.teledit.com')) {
      chk_uri = 'N'
    }
    if (chk_uri == 'Y') {
      Linking.openURL(webViewState.url).catch((err) => {
        console.log('onNavigationStateChange Linking.openURL')
      })
      webViews.current.stopLoading()
    }

    //항상 앱 접속 확인
    if (webViewState.url.includes('?')) {
      webViewState.url = webViewState.url + '&chk_app=Y'
    }else{
      webViewState.url = webViewState.url + '?chk_app=Y'
    }



    console.log(webViewState.url)
    set_urls(webViewState.url)

    //안드로이드 뒤로가기 버튼 처리
    BackHandler.addEventListener('hardwareBackPress', handleBackButton)
  }


  const handleBackButton = () => {
    console.log('handleBackButton');

    //제일 첫페이지에서 뒤로가기시 어플 종료
    if (navigation.isFocused() === true) {
      //다른 화면갔을경우 뒤로가기 막기 위한 요소

      console.log("1"+urls)
      console.log("2"+app_domain)


      if (urls == app_domain || urls == exit_domain) {
        Alert.alert('어플을 종료할까요?', '', [
          { text: '네', onPress: () => BackHandler.exitApp() },
          { text: '아니요' },
        ])
      } else {
        //if (webViews.current) {
        //  webViews.current.injectJavaScript('javascript:history.back();');
        //}
        BackKeyApi(urls);
      }
      return true
    } else {
      return false
    }
  }

  const BackKeyApi = async(uri) => {
    try {

      const res = await API.post('https://dmonster1886.cafe24.com/api/uri_return.php', {uri});
      console.log(res)

      if(res.data.result){
        let MoveUri = res.data.data.move_uri;
        if(MoveUri === ""){
          webViews.current.goBack();
        }else{
          MovePage(MoveUri);
        }
      }

    } catch (error) {
      webViews.current.goBack();
    }
  }


  const MovePage = async (MoveUri) => {


    let moveUri = 'window.location = "' + MoveUri +'"';
    webViews.current.injectJavaScript(moveUri);
  }

  const onShouldStartLoadWithRequest = (event) => {
    const { url, lockIdentifier } = event
    var URI = require('urijs')
    var uri = new URI(url)

    console.log('onShouldStartLoadWithRequest : ', uri);

    if (
      /* && react-native-webview 버전이 v10.8.3 이상 */
      event.lockIdentifier === 0
    ) {
      /**
       * [feature/react-native-webview] 웹뷰 첫 렌더링시 lockIdentifier === 0
       * 이때 무조건 onShouldStartLoadWithRequest를 true 처리하기 때문에
       * Error Loading Page 에러가 발생하므로
       * 강제로 lockIdentifier를 1로 변환시키도록 아래 네이티브 코드 호출
       */
      RNCWebView.onShouldStartLoadWithRequestCallback(
        false,
        event.lockIdentifier
      )
    }

    if (
      event.url.startsWith('http://') ||
      event.url.startsWith('https://') ||
      event.url.startsWith('about:blank')
    ) {
      if (uri.hostname() != '') {
        var chk_uri = 'Y'

        if (uri.hostname() != domain_url) {
          chk_uri = 'N'
        }
        if (uri.hostname() != 'postcode.map.daum.net') {
          chk_uri = 'N'
        }
        if (uri.hostname() != 'kauth.kakao.com') {
          chk_uri = 'N'
        }
        if (uri.hostname() != 'appleid.apple.com') {
          chk_uri = 'N'
        }
        if (uri.hostname() != 'nid.naver.com') {
          chk_uri = 'N'
        }
        if (uri.hostname() != 'm.facebook.com') {
          chk_uri = 'N'
        }
        if (uri.hostname() != 'mobile.inicis.com') {
          chk_uri = 'N'
        }
        if (uri.hostname() != 'service.iamport.kr') {
          chk_uri = 'N'
        }
        if (uri.hostname() != 'ksmobile.inicis.com') {
          chk_uri = 'N'
        }
        if(uri.query().includes("tt=nb")) {
          chk_uri = 'Y'
        }
        if (chk_uri == 'Y') {
          Linking.openURL(event.url).catch((err) => {
            console.log(
              'onShouldStartLoadWithRequest Linking.openURL'
            )
          })
          return false
        }
      }

      return true
    }
    if (
      event.url.startsWith('tel:') ||
      event.url.startsWith('mailto:') ||
      event.url.startsWith('maps:') ||
      event.url.startsWith('geo:') ||
      event.url.startsWith('sms:')
    ) {
      Linking.openURL(event.url).catch((er) => {
        console.log('Failed to open Link: ' + er.message)
      })
      return false
    }

    if (Platform.OS === 'android') {
      const SendIntentAndroid = require('react-native-send-intent');
      SendIntentAndroid.openChromeIntent(event.url)
        .then(isOpened => {
          if (!isOpened) { alert('앱 실행이 실패했습니다'); }
        })
        .catch(err => {
          console.log(err);
        });

      return false;

    } else {
      Linking.openURL(event.url)
        .catch(err => {
          alert('앱 실행이 실패했습니다. 설치가 되어있지 않은 경우 설치하기 버튼을 눌러주세요.');
        });
      return false;
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {is_loading ? (
        <View style={{ flex: 1, height: height }}>
          <WebView
            ref={webViews}
            source={{ uri: webview_url }}
            useWebKit={true}
            sharedCookiesEnabled
            onMessage={(webViews) => onWebViewMessage(webViews)}
            onNavigationStateChange={(webViews) =>
              onNavigationStateChange(webViews)
            }
            onShouldStartLoadWithRequest={
              onShouldStartLoadWithRequest
            }
            javaScriptEnabledAndroid={true}
            allowFileAccess={true}
            renderLoading={true}
            mediaPlaybackRequiresUserAction={false}
            setJavaScriptEnabled={false}
            scalesPageToFit={true}
            allowsFullscreenVideo={true}
            allowsInlineMediaPlayback={true}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            mixedContentMode={'compatibility'}
            overScrollMode={'never'}
            userAgent="Mozilla/5.0 (Linux; Android 8.0.0; SM-G935S Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Mobile Safari/537.36"
          />
        </View>
      ) : (
        <View style={{ marginTop: '49%' }}>
          <ActivityIndicator size="large" />
        </View>
      )}

    </SafeAreaView>
  )
}

export default WebViewPage
