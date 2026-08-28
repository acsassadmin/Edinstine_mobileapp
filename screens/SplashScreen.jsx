import React,{useEffect,useRef} from "react";
import { Dimensions, StyleSheet,View } from "react-native";
import LottieView from "lottie-react-native";

const {width,height} = Dimensions.get('window');

const SplashScreen = ({onAnimationFinish}) => {
    const animationRef = useRef(null);

    useEffect(() =>{
        const displayDuration = 15000;

        const timer = setTimeout(() =>{
            if(onAnimationFinish){
                onAnimationFinish();
            }
        }
        ,displayDuration);

        return ()=> clearTimeout(timer);

    },[onAnimationFinish])

    return (
        <View style={styles.container}>
            <LottieView ref={animationRef}
                source={require('../assets/splash material/splash.json')}
                autoPlay
                loop={false}
                onAnimationFinish={onAnimationFinish}
                style={styles.animation}
            />
        </View>
    );
}

export default SplashScreen;

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#ffffff',
        justifyContent:'center',
        alignItems:'center'
    },
    animation:{
        width:width,
        height:height,
    }
})