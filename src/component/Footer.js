import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import React, {useEffect} from 'react';


const Footer = ({navigation}) => {


  return (
    <View style={{...styles.bottomBar}}>
      <Pressable
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => {

          navigation.navigate('HomePage');
        }}>
        <Text>메인</Text>
      </Pressable>
      <Pressable
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => {
            navigation.navigate('WebViewPage');
        }}>
        <Text>웹뷰</Text>
      </Pressable>
    </View>
  )
};

export default Footer;


const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    ...Platform.select({
      ios: {},
      android: {
        position: 'absolute',
      },
    }),
    width: '100%',
    height: 60,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'space-around',
    ...Platform.select({
      android: {elevation: 8},
      ios: {
        shadowColor: '#00000029',
        shadowOpacity: 0.6,
        shadowRadius: 1,
        shadowOffset: {
          height: -2,
        },
      },
    }),
  },
});
