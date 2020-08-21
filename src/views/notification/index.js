import React, { Component } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import ErrorDisplay, {
  ElementCustom,
  AlertCommon,
} from "../../components/error";
import { getListNotify } from "../../service/notify";
import { connect } from "react-redux";
import Spinner from "react-native-loading-spinner-overlay";
import moment from "moment";
import {
  sizeHeight,
  sizeWidth,
  sizeFont,
} from "../../utils/helper/size.helper";
import { trim } from "lodash";
import { COLOR } from "../../utils/color/colors";
import { Content } from "native-base";
import _ from "lodash";
import ListNotification from "./listNotification";
import { countNotify } from "../../action/notifyAction";

class Notification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      refreshing: false,
      loadMore: false,
    };
    this.offset = 1;
    this.message;
    this.onEndReachedCalledDuringMomentum = true;
  }
  onMomentumScrollBegin = () => {
    console.log("Hello");
    this.onEndReachedCalledDuringMomentum = false;
    //alert("1");
    console.log(this.onEndReachedCalledDuringMomentum);
  };
  onRefresh = () => {
    const { authUser } = this.props;
    getListNotify({
      USERNAME: authUser.USERNAME,
      PAGE: this.offset,
      NUMOFPAGE: 15,
      IDSHOP: "BABU12",
    })
      .then((result) => {
        console.log("Result", result);
        if (result.data.ERROR === "0000") {
          this.setState({ data: result.data.INFO }, () => {
            this.props.countNotify(result.data.SUM_NOT_READ);
          });
        } else {
          AlertCommon("Thông báo", result.data.RESULT, () => null);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  handleLoad = () => {
    const { authUser } = this.props;
    this.setState({ loadMore: true }, () => {
      console.log("page", this.offset, this.onEndReachedCalledDuringMomentum);
      if (!this.onEndReachedCalledDuringMomentum) {
        //alert("1");
        this.offset = this.offset + 1;
        getListNotify({
          USERNAME: authUser.USERNAME,
          PAGE: this.offset,
          NUMOFPAGE: 15,
          IDSHOP: "BABU12",
        })
          .then((result) => {
            console.log("Result", result);
            if (result.data.ERROR === "0000") {
              this.setState(
                { data: _.concat(this.state.data, result.data.INFO) },
                () => {
                  this.setState({
                    loadMore: false,
                  });
                }
              );
            } else {
              this.setState({ loadMore: false });
              //this.onEndReachedCalledDuringMomentum = true;
            }
          })
          .catch((error) => {
            this.setState({ loadMore: false });
            console.log(error);
          });
        this.onEndReachedCalledDuringMomentum = true;
      } else {
        //alert(1);
        // if (this.onEndReachedCalledDuringMomentum === true) {
        //   this.setState({
        //     loadMore: false,
        //   });
        // }
      }
    });
  };
  componentDidMount() {
    const { authUser } = this.props;
    getListNotify({
      USERNAME: authUser.USERNAME,
      PAGE: this.offset,
      NUMOFPAGE: 15,
      IDSHOP: "BABU12",
    })
      .then((result) => {
        console.log("Result", result);
        if (result.data.ERROR === "0000") {
          this.setState({ data: result.data.INFO }, () => {
            this.setState({
              loading: false,
            });
          });
        } else {
          this.setState({ loading: false }, () => {
            this.message = setTimeout(() => {
              AlertCommon("Thông báo", result.data.RESULT, () => null);
            }, 10);
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  componentWillUnmount() {
    clearTimeout(this.message);
  }
  render() {
    const { data, loading, loadMore } = this.state;
    console.log("status", data, loadMore);
    return loading ? (
      <Spinner
        visible={loading}
        animation="fade"
        customIndicator={<ElementCustom />}
      />
    ) : (
      <View style={{ alignItems: "center", flex: 1 }}>
        <ListNotification
          data={data}
          handleLoad={this.handleLoad}
          onMomentumScrollBegin={this.onMomentumScrollBegin}
          loadMore={loadMore}
          onRefresh={this.onRefresh}
          navigation={this.props.navigation}
        />
      </View>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    status: state.authUser.status,
    authUser: state.authUser.authUser,
    username: state.authUser.username,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    countNotify: (text) => dispatch(countNotify(text)),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Notification);
