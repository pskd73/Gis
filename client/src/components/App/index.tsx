import * as React from "react";
import * as Actions from "../../actions";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router";
import {RootState} from "../../reducers";
import {MainSection} from "../../components";
import {AppState} from "../../reducers/app";
import Socket from "../../utils/socket";
import Workdir from "../Workdir";
import Commits from "../Commits";
import Todos from "../Todos";
import {Row, Col} from "react-bootstrap";
import Statistics from "../Statistics";
import MostUsedWords from "../MostUsedWords";
import LinesOfCode from "../LinesOfCode";
import "./style.scss";

export namespace App {
  export interface Props extends RouteComponentProps<void> {
    actions: typeof Actions,
    currentBranch: string,
    config: AppState.Config
  }

  export interface State {
    time: Date
  }
}

@connect(mapStateToProps, mapDispatchToProps)
export class App extends React.Component<App.Props, App.State> {
  private socket: Socket;
  private timer;

  constructor() {
    super();
    this.state = {
      time: new Date()
    }
  }

  componentWillUnmount() {
    this.timer && clearInterval(this.timer);
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({time: new Date()});
    }, 1000);
    this.socket = new Socket();
    this.socket.setRoutes([
      {
        path: "init",
        onReceive: this.props.actions.init
      },
      {
        path: "branches",
        onReceive: this.props.actions.setBranches
      },
      {
        path: "currentBranch",
        onReceive: this.props.actions.setCurrentBranch
      },
      {
        path: "diff",
        onReceive: this.props.actions.setDiff
      },
      {
        path: "commits",
        onReceive: this.props.actions.setCommits
      },
      {
        path: "todos",
        onReceive: this.props.actions.setTodos
      }
    ]);
    this.socket.listen();
  }

  render() {
    return (
      <div className="app">
        <Col md={12}>
          <div className="header">
            <h3>Gis - {this.props.currentBranch}</h3>
            <div className="center-container">
              <strong>{this.state.time.toLocaleString()}</strong>
              <br/>
              {this.props.config.origin}
            </div>
            <div>
              <h5>{this.props.config.email} | {this.props.config.name}</h5>
            </div>
          </div>
          <Row>
            <Col md={3}>
              <Commits/>
            </Col>
            <Col md={3}>
              <Todos/>
              <Workdir/>
            </Col>
            <Col md={6}>
              <Statistics/>
              <Row>
                <Col md={3}>
                  <MostUsedWords/>
                </Col>
                <Col md={9}>
                  <LinesOfCode/>
                </Col>
              </Row>
            </Col>
          </Row>
          {this.props.children}
        </Col>
      </div>
    );
  }
}

function mapStateToProps(state: RootState) {
  return {
    currentBranch: state.app.currentBranch,
    config: state.app.config
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions as any, dispatch)
  };
}
