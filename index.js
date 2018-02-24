/**
* React Native Sliding Up Panel
* Copyright (C) 2015-present
* Niña Manalo
* https://github.com/ninamanalo/
* nina.manalo19@gmail.com
*
* Modified by Kenneth Tsang (jxeeno)
* Adds ES6, non-restrictive pan and snaps at top
*/

'use strict';

import React, { Component } from 'react';
import ReactNative, { View, PanResponder,  Text, AppRegistry, Image, Dimensions, LayoutAnimation, UIManager} from 'react-native';

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;

var BASE_CONTAINER_HEIGHT = 40;

const getDragThreshold = ({ moveX, moveY, dx, dy}) => {
  const draggedDown = dy > 30;
  const draggedUp = dy < -30;

  return draggedUp || draggedDown;
}

export default class SlidingUpPanel extends Component {

  panResponder = {};
  previousTop = -BASE_CONTAINER_HEIGHT;
  mainContainerHeight = 0;

  swipeDetected = false;

  state = {
    handlerHeight : this.props.handlerHeight,
    containerHeight : this.props.containerHeight,
    containerMinimumHeight : this.props.containerMinimumHeight || this.props.containerHeight,
    containerMaximumHeight : this.props.containerMaximumHeight,
    containerHalfHeight : 0,
    containerBackgroundColor : this.props.containerBackgroundColor,
    containerOpacity : this.props.containerOpacity,

    handlerView : this.props.handlerDefaultView,

    handlerBackgroundColor : this.props.handlerBackgroundColor,
    handlerOpacity : this.props.handlerOpacity,
    allowStayMiddle : this.props.allowStayMiddle,

    middleList : false,
  };

  componentDidMount() {
    var containerMinimumHeight = this.state.containerMinimumHeight;
    var containerMaximumHeight = this.state.containerMaximumHeight;
    var containerHalfHeight = this.state.containerHalfHeight;
    var containerBackgroundColor = this.state.containerBackgroundColor;
    var containerOpacity = this.state.containerOpacity;

    var handlerView = this.state.handlerView;

    var handlerHeight = this.state.handlerHeight;
    this.mainContainerHeight = this.state.containerHeight;
    var handlerBackgroundColor = this.state.handlerBackgroundColor;
    var handlerOpacity = this.state.handlerOpacity;

    var allowStayMiddle = this.state.allowStayMiddle;

    //MAKE SURE PROPERTIES ARE SET

    if (handlerHeight == undefined) {
      handlerHeight = BASE_CONTAINER_HEIGHT;
      this.setState({
        handlerHeight,
        containerMinimumHeight : BASE_CONTAINER_HEIGHT,
      });
    }

    if (handlerView == undefined) {
      throw "Set a handler view. Hint: It is a React Class."
    }

    if (containerMaximumHeight == undefined) {
      containerMaximumHeight = deviceHeight
      this.setState({
        containerMaximumHeight,
      });
    }

    if (containerHalfHeight == 0) {
      containerHalfHeight = Math.round((containerMaximumHeight + handlerHeight) / 2);
      this.setState({
        containerHalfHeight,
      });
    }

    if (allowStayMiddle == undefined) {
      allowStayMiddle = true;
      this.setState({
        allowStayMiddle,
      });
    }
    
    // this.mainContainerHeight = this.state.containerMinimumHeight
    // this.setState({
    //   containerHeight : this.mainContainerHeight
    // });

    // default to middle position

    let containerHeight = parseInt((this.state.containerMaximumHeight - this.state.containerMinimumHeight)/2) + this.state.containerMinimumHeight;
    this.setState({
      containerHeight : containerHeight,
    });

    if(this.props.onEnd) {
      this.props.onEnd(containerHeight);
    }

    if (containerBackgroundColor == undefined) {
      containerBackgroundColor = 'white'
      this.setState({
        containerBackgroundColor,
      });
    }

    if (containerOpacity == undefined) {
      containerOpacity = 1;
      this.setState({
        containerOpacity,
      });
    }

    if (handlerBackgroundColor == undefined) {
      handlerBackgroundColor = 'white';
      this.setState({
        handlerBackgroundColor,
      });
    }

    if (handlerOpacity == undefined) {
      handlerOpacity = 1;
      this.setState({
        handlerBackgroundColor,
      });
    }

  };

  componentWillReceiveProps(props){
    this.setState({handlerView: props.handlerDefaultView})
  }

  render() {
    return (
      <View
        style = {{
          position: 'absolute',
          bottom: 0,
          opacity: this.state.containerOpacity,
          height: this.state.containerHeight,
          paddingBottom: this.state.leastContainerHeight,
          backgroundColor : this.state.containerBackgroundColor
        }}>
        <View
          style = {{
            height : this.state.handlerHeight,
            width : deviceWidth,
            justifyContent : 'center',
            opacity : this.state.handlerOpacity,
            backgroundColor : this.state.handlerBackgroundColor}}
          {...this.panResponder.panHandlers}>
          {this.state.handlerView}
        </View>
        {this.props.children}
      </View>
    );
  };

  reloadHeight(height) {
    this.setState({
      containerHeight : height,
      middleList : false
    });
    this.mainContainerHeight = height;
  };

  collapsePanel() {
    this.setState({
      containerHeight: this.state.containerMinimumHeight,
    });
  };

  componentWillMount() {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder.bind(this),
      onMoveShouldSetPanResponder: this.handleMoveShouldSetPanResponder.bind(this),
      onPanResponderMove: this.handlePanResponderMove.bind(this),
      onPanResponderRelease: this.handlePanResponderEnd.bind(this),
      onPanResponderTerminate: this.handlePanResponderEnd.bind(this),
      onPanResponderStart: this.handlePanResponderStart.bind(this)
    });
  };

  handleStartShouldSetPanResponder(e, gestureState) {
    // console.log('handleStartShouldSetPanResponder');
    // console.log(gestureState);
    // var dy = gestureState.dy;
    // return (Math.abs(dy) > 40)
    return true;
  };

  handleMoveShouldSetPanResponder(e, gestureState) {
    return !!getDragThreshold(gestureState);
  };

  handlePanResponderMove(e, gestureState) {
    var dy = gestureState.dy;
    var y0 = gestureState.y0;
    var negativeY = -dy;

    var dyVelocity = gestureState.vy;

    var positionY = negativeY - this.previousTop;

    // console.log(dy);
    
    // if(Math.abs(dy) < 10){
    //   return null;
    // }

    if (positionY >= this.state.containerMinimumHeight && positionY <= this.state.containerMaximumHeight) {
      // console.log('handlePanResponderMove() -- middle=' + positionY);
      var lessMiddle = this.state.containerHalfHeight - 40;
      var moreMiddle = this.state.containerHalfHeight + 40;

      if (positionY >= lessMiddle && positionY <= moreMiddle) {

        if (!this.state.allowStayMiddle) {
          this.handleMiddleFalse(positionY, dyVelocity);
        } else {
          this.setState({
            containerHeight : this.state.containerHalfHeight,
            middleList : true,
          });

          if (this.props.getContainerHeight != undefined) {
            this.props.getContainerHeight(this.state.containerHalfHeight);
          }

          if (this.props.getContainerHeightEnd != undefined) {
            this.props.getContainerHeightEnd(this.state.containerHalfHeight);
          }
        }

      } else {
        // console.log('handlePanResponderMove() -- NOT middle=' + positionY);
        this.handleMiddleFalse(positionY);
      }

      this.mainContainerHeight = this.state.containerHeight;
    }
  };

  handleMiddleFalse(positionY, dyVelocity) {

    if(dyVelocity > 1.5){
      // snap t bottom
      // LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      // let containerHeight = this.state.containerMinimumHeight;
      // this.previousTop = -this.state.containerMinimumHeight;
      this.swipeDetected = true;
      // this.setState({
      //   containerHeight : containerHeight,
      // });
    }else if(dyVelocity < -1.5){
      // LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      // let containerHeight = this.state.containerMaximumHeight;
      this.swipeDetected = true;
      // this.setState({
      //   containerHeight : containerHeight,
      // });
    }else{
      // this.setState({
      //   containerHeight : positionY,
      //   middleList : false
      // });
    }

    this.setState({
      containerHeight : positionY,
      middleList : false
    });

    if (this.props.getContainerHeight != undefined) {
      this.props.getContainerHeight(positionY);
    }
  };

  handlePanResponderStart (e, gestureState) {
    console.log("handle panResponderStart")
    console.log(gestureState);

    if(this.props.onStart) {
      this.props.onStart();
    }

    var dy = gestureState.dy;
    var negativeY = -dy;
    this.previousTop = negativeY - this.state.containerHeight;
    this.setState({
      middleList : false
    });

  };

  handlePanResponderEnd (e, gestureState) {
    // if(this.props.onEnd) {
    //   this.props.onEnd(this.state.containerHeight);
    // }

    var dy = gestureState.dy;
    var dyVelocity = gestureState.vy;

    // console.log("dyVelocity "+dyVelocity)

    if((this.swipeDetected && dyVelocity > 0.04) || this.state.containerHeight < this.state.containerMinimumHeight + 100){
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      // snap t bottom
      let containerHeight = this.state.containerMinimumHeight;
      this.previousTop = -this.state.containerMinimumHeight;
      this.setState({
        containerHeight : containerHeight,
      });
      if(this.props.onEnd) {
        this.props.onEnd(containerHeight);
      }
    }else if((this.swipeDetected && dyVelocity < -0.04) || this.state.containerHeight > this.state.containerMaximumHeight - 100){
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      let containerHeight = this.state.containerMaximumHeight;
      this.previousTop += dy;
      this.setState({
        containerHeight : containerHeight,
      });
      if(this.props.onEnd) {
        this.props.onEnd(containerHeight);
      }
    }else if(this.props.onEnd) {
      this.props.onEnd(this.state.containerHeight);
    }

    this.swipeDetected = false;

    return;

    // var containerHeight = this.state.containerMaximumHeight;
    // var dy = gestureState.dy;
    // var y0 = gestureState.y0;

    // if (dy == 0) {
    //   var newContainerHeight = this.state.containerHalfHeight;
    //   var middleList = true;

    //   if (this.state.containerHeight == this.state.containerHalfHeight || this.state.containerHeight == this.state.containerMaximumHeight) {
    //     newContainerHeight = this.state.containerMinimumHeight;
    //     middleList = false;
    //   }

    //   if (!this.state.allowStayMiddle) {
    //     newContainerHeight = this.state.containerMinimumHeight;
    //     middleList = false;
    //   }

    //   this.setState({
    //     containerHeight : newContainerHeight,
    //     middleList : middleList,
    //   });

    //   if (this.props.getContainerHeight != undefined) {
    //     this.props.getContainerHeight(newContainerHeight);
    //   }

    //   if (this.props.getContainerHeightEnd != undefined) {
    //     this.props.getContainerHeightEnd(newContainerHeight);
    //   }

    //   this.mainContainerHeight = newContainerHeight;
    // } else {

    //   if (dy < 0) {
    //     containerHeight = this.state.containerMaximumHeight;
    //     this.previousTop += dy;
    //   } else {

    //     containerHeight = this.state.containerMinimumHeight;
    //     this.previousTop = -this.state.containerMinimumHeight;
    //   }

    //   if (!this.state.middleList) {
    //     this.setState({
    //       containerHeight : containerHeight,
    //     });

    //     if (this.props.getContainerHeight != undefined) {
    //       this.props.getContainerHeight(containerHeight);
    //     }

    //     if (this.props.getContainerHeightEnd != undefined) {
    //       this.props.getContainerHeightEnd(containerHeight);
    //     }

    //   }

    //   this.mainContainerHeight = containerHeight;

    // }
  };

};

// module.exports = SlidingUpPanel;
