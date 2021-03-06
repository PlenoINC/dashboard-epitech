import React, { Component } from 'react';
import { Animated, Easing, TouchableOpacity } from 'react-native';

class Heartbeat extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pulse: new Animated.Value(1),
            rotate: new Animated.Value(1),
            loading: false,
        };
    }

    startPulse() {
        if (!this.props.hasPulse || !this.state.loading) {
            return;
        }

        this.state.rotate.setValue(0);

        Animated.parallel([
            Animated.sequence([
                Animated.timing(this.state.pulse, {
                    toValue: this.props.growTo,
                    duration: 300,
                    delay: 400,
                }),
                Animated.timing(this.state.pulse, {
                    toValue: 1,
                    easing: Easing.easeOut,
                    duration: 300,
                }),
                Animated.delay(200),
            ]),
            Animated.timing(this.state.rotate, {
                toValue: 1,
                easing: Easing.easeOut,
                duration: 800,
            })
        ]).start(this.startPulse.bind(this));
    }

    async stall(stallTime = 900) {
        await new Promise(resolve => setTimeout(resolve, stallTime));
    }

    onPressPromise() {
        return new Promise((resolve) => {
            try {
                this.props.onPress().then((res) => resolve(res));
            } catch (e) {
                resolve(false);
            }
        });
    }

    animate() {
        this.setState({ loading: true }, () => {
            this.startPulse();
            this.stall().then(() => {
                this.onPressPromise().then(() => this.setState({ loading: false }))
            });
        });
    }

    render() {
        const { pulse, rotate } = this.state;

        const rotateContent = rotate.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });

        return (
            <Animated.View
                style={[
                    this.props.style,
                    { transform: [{ scale: pulse }, { rotate: rotateContent }] }
                ]}
            >
                <TouchableOpacity
                    onPress={() => this.animate()}
                    disabled={this.state.loading}
                >
                    {this.props.children}
                </TouchableOpacity>
            </Animated.View>
        )
    }
}

Heartbeat.propTypes = {
    hasPulse: React.PropTypes.bool,
    growTo: React.PropTypes.number,
    onPress: React.PropTypes.func,
    style: React.PropTypes.object,
};

Heartbeat.defaultProps = {
    hasPulse: true,
    growTo: 1.2,
};

export default Heartbeat;
