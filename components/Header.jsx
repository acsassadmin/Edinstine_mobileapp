import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import BackButton from './BackButton'

const Header = ({title='Header'}) => {
  return (
    <View style={{display:'flex',flexDirection:"row",gap:7,paddingBottom:10}}>
        <BackButton/>
      <Text style={{fontSize:19,color:'#86b952',fontWeight:600}}>{title}</Text>

    </View>
  )
}

export default Header

const styles = StyleSheet.create({})