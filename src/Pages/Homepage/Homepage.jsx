import "./HomepageStyles.scss";

import AddPost from "./../../components/HomePage/AddPost/AddPost";
import SortPosts from "../../components/HomePage/SortPosts/SortPosts";
import TopUsers from "../../components/HomePage/TopUsers/TopUsers";
import Post from "../../components/Post/Post";
import FeedSelect from "../../components/HomePage/FeedSelect/FeedSelect";

import { useEffect, useState, useContext } from "react";
import axios from "../../assets/axios/axios.js";
import { ImpactStore } from "../../store/ImpactStore";
import InfiniteScroll from "react-infinite-scroll-component";
import { useParams } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import jwt_decode from "jwt-decode";

import { FaExchangeAlt } from "react-icons/fa";
import IconButton from "@mui/material/IconButton";
import DisplaySettingsIcon from "@mui/icons-material/DisplaySettings";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

const DialogFeed = ({ open, emitClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleClose = () => {
    emitClose();
  };

  return (
    <div>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <div className="feed-dialog__select">
          <FeedSelect />
        </div>
      </Dialog>
    </div>
  );
};

const Homepage = () => {
  const location = useLocation();
  const defaultFilter = (filterType) => {
    if (routeFilter != undefined) {
      let filterSplit = routeFilter.split("&").reverse();
      if (filterType == "zone") {
        for (const el of filterSplit) {
          let elSplit = el.split("=");
          if (elSplit[0] == "localityId")
            return { type: elSplit[0], id: elSplit[1] };
          if (elSplit[0] == "villageId")
            return { type: elSplit[0], id: elSplit[1] };
          if (elSplit[0] == "countyId")
            return { type: elSplit[0], id: elSplit[1] };
        }
      }
      if (filterType == "filter") {
        for (const el of filterSplit) {
          let elSplit = el.split("=");
          if (elSplit[0] == "filter") return elSplit[1];
        }
        return "recent";
      }
      if (filterType == "time") {
        for (const el of filterSplit) {
          let elSplit = el.split("=");
          if (elSplit[0] == "time") return elSplit[1];
        }
        return "";
      }
    } else {
      if (filterType == "zone")
        return {
          type: user.localityId ? "localityId" : "villageId",
          id: user.localityId ? user.localityId : user.villageId,
        };
      if (filterType == "filter") return "recent";
      if (filterType == "time") return "";
    }
  };

  let navigate = useNavigate();
  let { routeFilter } = useParams();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(1);
  const { user, setUser } = useContext(ImpactStore);
  const { feedDialog, setFeedDialog } = useContext(ImpactStore);
  const [posts, setPosts] = useState([]);
  const [zone, setZone] = useState(() => defaultFilter("zone"));
  const [filter, setFilter] = useState(() => defaultFilter("filter"));
  const [time, setTime] = useState(() => defaultFilter("time"));
  const [top, setTop] = useState([]);
  const [loader, setLoader] = useState(true);

  const fetchData = () => {
    axios
      .get(
        `/articles?${zone.type}=${zone.id}&${filter}=true&timespan=${time}&offset=${
          page * 10
        }&limit=10&cursor=`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(async (response) => {
        // handle success
       if(filter!="best")  setLoader(false);
        if (response.data.errors) navigate("/");

        // Logic for mixing best posts with new posts
        let newPosts = {
          data: {
            articles: [],
          },
        };

        if (filter == "best")
          newPosts = await axios.get(
            `/articles?${zone.type}=${zone.id}&recent=true&timespan=${time}&offset=${
              page * 10
            }&limit=1&cursor=`,
            {
              headers: {
                accept: "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setLoader(false);
        
        
        let verifyArray = [
          ...posts,
          ...response.data.articles,
          ...(newPosts.data ? newPosts.data.articles : []),
        ];
        // Removing dublicates
        verifyArray = verifyArray.reduce((unique, o) => {
          if (!unique.some((obj) => obj.id === o.id)) {
            unique.push(o);
          }
          return unique;
        }, []);
        // verifyArray = verifyArray.filter(
        //   (value, index, self) =>
        //     index ===
        //     self.findIndex(
        //       (t) => t.id === value.id
        //     )
        // );
        //
        setLimit(response.data.limit);
        setPosts([...verifyArray]);
      })
      .catch((error) => {
        // handle error
        console.log(error);
      })
      .then(() => {
        // always executed
      });
  };

  const getTop = () => {
    axios
      .get(`/users?${zone.type}=${zone.id}&offset=0&limit=10&top=true`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        // handle success
        if (response.data.errors) navigate("/");
        setTop(response.data);
      })
      .catch((error) => {
        // handle error
        console.log(error);
      })
      .then(() => {
        // always executed
      });
  };

  useEffect(() => {
    fetchData();
    getTop();
  }, [page]);

  // useEffect(()=>{
  //   setZone(defaultFilter("zone"));
  //   setFilter(defaultFilter("filter"));
  //   // setPosts([]);
  //   // setPage(0);
  //   fetchData();
  // },[location])

  const changeFeed = (filter) => {
    let newParams = "";
    if (routeFilter) {
      let filterSplit = routeFilter.split("&").reverse();
      for (const el of filterSplit) {
        let elSplit = el.split("=");
        if (elSplit[0] != "filter" && elSplit[0] != "time")
          newParams = elSplit[0] + "=" + elSplit[1] + "&" + newParams;
      }
    } else {
      if (user.localityId) newParams = "localityId=" + user.localityId + "&";
      else newParams = "villageId=" + user.villageId + "&";
    }
    // alert(newParams);
    navigate("/" + newParams + "filter=" + filter);
    // if (routeFilter == undefined) {
    //   navigate(`/${zone.type}-${zone.id}-${filter}`);
    // } else {
    //   let filterSplit = routeFilter.split("-");
    //   navigate(`/${filterSplit[0]}-${filterSplit[1]}-${filter}`);
    // }
  };

  const updateArticle = (articleId) => {
    axios
      .get(`/articles/${articleId}`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        // handle success
        let index = posts.findIndex((el) => el.id == articleId);
        let newPosts = [...posts];
        newPosts[index] = response.data;
        setPosts(newPosts);
        getTop();
      })
      .catch((error) => {
        // handle error
        console.log(error);
      })
      .then(() => {
        // always executed
      });
  };

  const deleteArticle = (articleId) => {
    setPosts(posts.filter((p) => p.id != articleId));
  };

  return (
    <div className="homepage">
      <DialogFeed open={feedDialog} emitClose={() => setFeedDialog(false)} />

      <div className="homepage__container">
        <div className="homepage__left">
          <AddPost />
          <SortPosts selectedSort={filter} time={time} emitSort={changeFeed} />
          {/* {posts.length} */}
          {posts.length != 0 ? (
            <InfiniteScroll
              dataLength={posts.length} //This is important field to render the next data
              next={() => setPage(page + 1)}
              hasMore={true}
              loader={
                filter != "best" ? (
                  posts.length == limit ? (
                    <h4 className="scroll-text">Ai vazut toate postarile</h4>
                  ) : (
                    <h4 className="scroll-text">Se incarca...</h4>
                  )
                ) : (
                  ""
                )
              }
            >
              <div className="homepage__posts">
                {posts.map((article) => (
                  <div key={article.id} className="homepage__post">
                    {/* Judet : {article.countyId ? article.countyId : ""}
                    <br />
                    Oras/comuna : {article.villageId ? article.villageId : ""}
                    <br />
                    Localitate : {article.localityId ? article.localityId : ""} */}
                    <Post
                      deleteArticle={deleteArticle}
                      updateArticle={updateArticle}
                      article={article}
                    />{" "}
                  </div>
                ))}
              </div>
            </InfiniteScroll>
          ) : (
            <h4 className="scroll-text">{loader==false&&posts.length == 0 ? "Nu exista postari" : ""}</h4>
          )}
        </div>
        <div className="homepage__right">
          <FeedSelect />
          <TopUsers users={top} />
        </div>
      </div>
    </div>
  );
};

export default Homepage;
