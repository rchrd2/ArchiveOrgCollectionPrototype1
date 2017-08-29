import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import logo from './logo.svg';
import './App.css';
import jQuery from 'jquery';

function buildSearchUrl(params) {
  params = Object.assign({
    q: 'collection: inlibrary',
    output: 'jsonp',
    rows: 100,
  }, params);
  var baseurl = 'https://archive.org/advancedsearch.php?callback=?&';
  return baseurl + jQuery.param(params);
}

function isCollection(doc) {
  return doc.mediatype === 'collection';
}

class Collection extends Component {
  constructor(props) {
    super(props);
    var defaultId = props.match.params.id || 'texts';
    this.state = {
      numFound: null,
      start: null,
      items: [],
      collections: [],
      identifier: defaultId,
      metadata: {}
    };
  }

  componentDidMount() {
    this.fetchData(this.state.identifier);
  }

  componentWillReceiveProps(nextProps) {
    //alert(JSON.stringify(nextProps, null, 2));
    this.setState({
      identifier: nextProps.match.params.id,
      items: [],
      collections: []
    });
    this.fetchData(nextProps.match.params.id);
  }

  fetchData(identifier) {
    // metadata
    jQuery.getJSON({
      url: 'https://archive.org/metadata/' + identifier + '/metadata',
    }).then((data) => {
      this.setState({
        metadata: data.result
      });
    });
    jQuery.getJSON(buildSearchUrl({
      q: 'collection: ' + identifier + ' AND NOT mediatype:collection',
      rows: 100,
    })).then((data) => {
      // console.log(data.response);
      this.setState({
        numFound: data.response.numFound,
        start: data.response.start,
        items: data.response.docs
      });
    });
    jQuery.getJSON(buildSearchUrl({
      q: 'collection: ' + identifier + ' AND mediatype:collection',
      rows: 10
    })).then((data) => {
      // console.log(data.response);
      this.setState({
        collections: data.response.docs
      });
    });
  }

  componentWillUnmount() {}

  renderDocs(docs) {
    return docs.map((doc) => {
      var className = '';
      var imgUrl = 'https://archive.org/services/img/' + doc.identifier;

      var extra = [];

      var url, hrefEl;
      if (isCollection(doc)) {
        hrefEl = <Link to={'/details/' + doc.identifier}>
          <img
            style={{backgroundImage: 'url('+imgUrl+')'}}
            className="db bg-center contain aspect-ratio--object" />
        </Link>;

        extra.push(
          <Link to={'/details/' + doc.identifier}>
            <div className="f5 lh-title mv0">{doc.title}</div>
          </Link>
        );
      } else {
        url = 'https://archive.org/details/' + doc.identifier;
        hrefEl = <a href={url}>
          <img
            style={{backgroundImage: 'url('+imgUrl+')'}}
            className="db bg-center contain aspect-ratio--object" />
        </a>;
        extra.push(
          <a href={'https://archive.org/details/' + doc.identifier}>
            <div className="f5 lh-title mv0">{doc.title}</div>
          </a>
        );
      }


      if (typeof doc.description == 'string') {
        extra.push(<p className="f6 lh-copy mt2">
          {doc.description.substr(0,100)}
        </p>);
      }


      if (isCollection(doc)) {
        extra.push(<div className="lh-copy mt2">
          <div className="f6">1234 items</div>
        </div>);
      }


      return <article
        className="br2 ba bw2 b--black-10  w-100 w-50-m w-25-l dib mw5-ns w-50-s mb4 mr3 v-top">

        <div className="aspect-ratio aspect-ratio--1x1">
          {hrefEl}
        </div>

        <div className="h4 pa2 ph3-ns pb3-ns pt3 black overflow-hidden">
          {extra}
        </div>
      </article>;

    });
  }



  render() {
    return (
      <div className="App-results pa2-s">

      <div className="pa4 meatdata-header">
        <img className="pa4 pt0 v-top" src={'https://archive.org/services/img/' + this.state.metadata.identifier} />

        <div className="dib">
          <div className="f2 mb4">{this.state.metadata.title}</div>
          <div className=" header-description">

            <div className="mw8" dangerouslySetInnerHTML={{__html:this.state.metadata.description}}></div>

          </div>
        </div>

      </div>

        <div className="flex-ns flex-row-ns">
          <FakeFacets/>
          <div className="flex-auto">


            <h2>Collections</h2>
            <div className="collections">
              {this.renderDocs(this.state.collections)}
            </div>
            <div className="mb5"><a href="#">See all collections</a></div>

            <h2>Items</h2>
            <div className="items">
              {this.renderDocs(this.state.items)}
            </div>

            <div className="mb5">
              <a href="#">Prev page</a>&nbsp;&nbsp;
              <a href="#">Next page</a>
            </div>


          </div>
        </div>
      </div>
    );
  }
}

//export default App;


const Home = () => (
  <div className="h5">
    <h2>Home</h2>
  </div>
)

const About = () => (
  <div>
    <h2>About</h2>
  </div>
)

const Topic = ({ match }) => (
  <div>
    <h3>{match.params.topicId}</h3>
  </div>
)

const FakeFacets = () => (
  <div className="facets flex-none nowrap w5 sticky pa3">
    <div className="f4 mb4">Filters</div>

    <div className="search">
      Search within
      <form>
        <input type="text" className="w4"/>
        <input type="submit" value="Search" />
      </form>
    </div>
    <br/>
    <br/>

    Filter<br/>
    <br/>
    <label><input type="checkbox" /> Lorum Ipsum</label><br/>
    <label><input type="checkbox" /> Lorum Ipsum</label><br/>
    <label><input type="checkbox" /> Lorum Ipsum</label><br/>
    <label><input type="checkbox" /> Lorum Ipsum</label><br/>
    <br/>
    <br/>
    Filter<br/>
    <br/>
    <label><input type="checkbox" /> Lorum Ipsum</label><br/>
    <label><input type="checkbox" /> Lorum Ipsum</label><br/>
    <label><input type="checkbox" /> Lorum Ipsum</label><br/>
    <label><input type="checkbox" /> Lorum Ipsum</label><br/>

  </div>
)

const Topics = ({ match }) => (
  <div>
    <h2>Topics</h2>
    <ul>
      <li>
        <Link to={`${match.url}/rendering`}>
          Rendering with React
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/components`}>
          Components
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/props-v-state`}>
          Props v. State
        </Link>
      </li>
    </ul>

    <Route path={`${match.url}/:topicId`} component={Topic}/>
    <Route exact path={match.url} render={() => (
      <h3>Please select a topic.</h3>
    )}/>
  </div>
)

const BasicExample = () => (
  <Router>
    <div className="App">
      <div className="App-header bg-near-white ">
        <div>
          <div className="link pr3">
            <img className="logo" src="/logo.svg" />
            <Link to="/"><span className="f3">Internet Archive</span></Link>
          </div>

          <div className="search dib fr">
            Logged in as <Link to="/">John Coltrane</Link>
          </div>

        </div>
        <div className="pt3">
          <div className="dib">
            &mdash;&nbsp;
            <div className="link pr2"><Link to="/details/web">Web</Link></div>
            <div className="link pr2"><Link to="/details/texts">Texts</Link></div>
            <div className="link pr2"><Link to="/details/movies">Movies</Link></div>
            <div className="link pr2"><Link to="/details/audio">Audio</Link></div>
            <div className="link pr2"><Link to="/details/software">Software</Link></div>
            <div className="link pr2"><Link to="/details/images">Images</Link></div>

          </div>
          <div className="search dib fr">
            <form>
              <input type="text"/>
              <input type="submit" value="Search" />
            </form>
          </div>
        </div>

      </div>

      <Route exact path="/" component={Home}/>
      <Route path="/about" component={About}/>
      <Route path="/details/:id" component={Collection}/>

      <footer className="bg-light-gray min-h5 cf">

       <section className="fl w-100">
         <div className="fl w-100 w-50-m w-25-l pa3-m pa4-l">
           <p className="f6 lh-copy measure">
            <b>Internet Archive</b><br/>
            About<br/>
            Contact<br/>
            Blog<br/>
            Projects<br/>
            Help<br/>
            Donate<br/>
            Terms<br/>
            Jobs<br/>
            Volunteer<br/>
            People<br/>
           </p>
         </div>
         <div className="fl w-100 w-50-m w-25-l pa3-m pa4-l">
           <p className="f6 lh-copy measure">
            <b>Internet Archive</b><br/>
            About<br/>
            Contact<br/>
            Blog<br/>
            Projects<br/>
            Help<br/>
            Donate<br/>
            Terms<br/>
            Jobs<br/>
            Volunteer<br/>
            People<br/>
           </p>
         </div>
         <div className="fl w-100 w-50-m w-25-l pa3-m pa4-l">
           <p className="f6 lh-copy measure">
            <b>Internet Archive</b><br/>
            About<br/>
            Contact<br/>
            Blog<br/>
            Projects<br/>
            Help<br/>
            Donate<br/>
            Terms<br/>
            Jobs<br/>
            Volunteer<br/>
            People<br/>
           </p>
         </div>
         <div className="fl w-100 w-50-m w-25-l pa3-m pa4-l">
           <p className="f6 lh-copy measure">
            <b>Internet Archive</b><br/>
            About<br/>
            Contact<br/>
            Blog<br/>
            Projects<br/>
            Help<br/>
            Donate<br/>
            Terms<br/>
            Jobs<br/>
            Volunteer<br/>
            People<br/>
           </p>
         </div>
       </section>
      </footer>


    </div>

  </Router>
)
export default BasicExample
