
var Header = React.createClass({
  render: function() {
    return (
      <div className="header">
        <span>{this.props.user}</span>
      </div>
    );
  }
});

var Hour = React.createClass({
  twoDigits: function (number) {
    return ('0'+number).slice(-2);
  },
  render: function() {
    var d = new Date(this.props.date);
    var hour = this.twoDigits(d.getDate()) + '/' + this.twoDigits(d.getMonth()) + '/' + this.twoDigits(d.getFullYear()) + ' ' + this.twoDigits(d.getHours()) + ':' + this.twoDigits(d.getMinutes());
    return (
      <div>
        {hour}
      </div>
    );
  }
});

var Entry = React.createClass({
  rawMarkup: function() {
    var rawMarkup = '';
    if (this.props.hasOwnProperty('children')) {
      rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    }
    return { __html: rawMarkup };
  },
  render: function() {
    if (this.props.entryID === 'new') {
      return (
        <div className="entry current">
          <span dangerouslySetInnerHTML={this.rawMarkup()} />
        </div>
      );
    }
    return (
      <div className="entry">
        <h4 className="entryDate">
          <Hour date={this.props.date} />
        </h4>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
});

var EntryBox = React.createClass({
  getURL: function() {
    return '/api/entries/user/'+this.props.user;
  },
  successQuery: function (data) {
    if (data.status === 'OK') {
      this.setState({data: data.results});
    }
  },
  errorQuery: function(xhr, status, err) {
    console.error(this.getURL(), status, err.toString());
  },
  loadEntryFromServer: function() {
    $.ajax({
      url: this.getURL(),
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.successQuery(data);
      }.bind(this),
      error: function(xhr, status, err) {
        this.errorQuery(xhr, status, err)
      }.bind(this)
    });
  },
  handleEntrySubmit: function(entry) {
    var entries = this.state.data;
    var newEntries = [entry].concat(entries);
    this.setState({data: newEntries});
    $.ajax({
      url: this.getURL(),
      dataType: 'json',
      type: 'POST',
      data: entry,
      success: function(data) {
        this.successQuery(data);
      }.bind(this),
      error: function(xhr, status, err) {
        this.errorQuery(xhr, status, err)
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadEntryFromServer();
    setInterval(this.loadEntryFromServer, 2000);
  },
  render: function() {
    return (
      <div className="entryBox">
        <h1>Posts</h1>
        <EntryForm onEntrySubmit={this.handleEntrySubmit} />
        <EntryList data={this.state.data} />
      </div>
    );
  }
});

var EntryList = React.createClass({
  render: function() {
    var entryNodes = this.props.data.map(function(entry) {
      return (
        <Entry date={entry.date} key={entry._id} entryID={entry._id}>
          {entry.text}
        </Entry>
      );
    });
    return (
      <div className="entryList">
        {entryNodes}
      </div>
    );
  }
});

var EntryForm = React.createClass({
  getInitialState: function() {
    return {author:this.props.user, date: Date.now(), text: '', _id:'new'};
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var text = this.state.text.trim();
    var date = Date.now();
    if (!text || !date) {
      return;
    }
    this.props.onEntrySubmit({author: this.props.user, date: Date.now(), text: text, _id:'new'});
    this.setState(this.getInitialState());
  },
  render: function() {
    return (
      <div>
        <Entry date={this.state.date} entryID={this.state._id} key={this.state._id}>{this.state.text}</Entry>
        <form className="entryForm" onSubmit={this.handleSubmit}>
          <textarea
            className="inputText"
            type="text"
            placeholder="Post anything (markdown accepted)..."
            value={this.state.text}
            onChange={this.handleTextChange}
          />
          <input type="submit" value="Post" />
        </form>
      </div>
    );
  }
});

var UserInfo = React.createClass({
  render: function() {
    return (
      <div className="userInfo">
        <img src="images/ProfilePhoto.png"></img>
        <h1><span className="octicon octicon-person"></span>Alejandro Fernández Haro</h1>
        <h2><span className="octicon octicon-mortar-board"></span>Telecommunications Engineer</h2>
        <h4><span className="octicon octicon-mark-github"></span><a href="https://github.com/afharo">afharo</a></h4>
        <h4><span className="octicon octicon-mail"></span><a href="mailto:afharo@gmail.com">afharo@gmail.com</a></h4>
      </div>
    );
  }
});

var Profile = React.createClass({
    render: function() {
      return (
        <div>
          <Header user={this.props.user}></Header>
          <UserInfo />
          <EntryBox user={this.props.user}></EntryBox>
        </div>
      );
    }
});

ReactDOM.render(
  <Profile user="afharo" />,
  document.getElementById('content')
);
