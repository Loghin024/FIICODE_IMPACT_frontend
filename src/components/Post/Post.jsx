import "./PostStyles.scss";
import { Link } from "react-router-dom";
import profileImage from "../../assets/images/default_profile_pic1.jpg";
import { useEffect, useState, useRef, useContext } from "react";

import MediaSlider from "./MediaSlider/MediaSlider";
import PostOptions from "./PostOptions/PostOptions";

import { BiDownvote, BiUpvote } from "react-icons/bi";
import { VscComment } from "react-icons/vsc";
import { MdOutlineFavorite } from "react-icons/md";
import { MdMoreHoriz } from "react-icons/md";

import testImage from "../../assets/images/dwipm_18.png";
import testImage2 from "../../assets/images/buletine-840x500.jpg";
import axios from "../../assets/axios/axios";
import jwt_decode from "jwt-decode";
import { ImpactStore } from "../../store/ImpactStore";
import { useNavigate, useLocation } from "react-router-dom";
import rankPerform from "../../utils/rank";
import defaultVote from "../../assets/images/votes/default.png";
import upVote from "../../assets/images/votes/upvote.png";
import downVote from "../../assets/images/votes/downvote.png";
import Status from "./Status/Status";
const testMedia = [
  // profileImage,
  testImage,
  testImage2,
];

const Post = ({ article, updateArticle, deleteArticle, comments }) => {
  const { user, setUser } = useContext(ImpactStore);
  const [favorite, setFavorite] = useState(false);
  const [showPostOptions, setShowOptions] = useState(false);
  let postOptionsRef = useRef();
  const navigate = useNavigate();
  const [rank, setRank] = useState(
    article.author.monthlyPoints >= 0
      ? () =>
          rankPerform(
            article.author.monthlyPoints,
            article.roleUser,
            article.admin
          )
      : {
          type: "Cetatean",
          color: "black",
          image: "default.jpg",
        }
  );

  const handleFavorite = () => {
    const userId = jwt_decode(localStorage.getItem("token")).userId;
    // favorite ? setFavorite(false) : setFavorite(true);
    if (article.favorites.length == 0) {
      axios
        .post(
          `/articles/${article.id}/users/${userId}/favorite`,
          {},
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          // handle success
          updateArticle(article.id);
        })
        .catch((error) => {
          // handle error
          console.log(error);
        })
        .then(() => {
          // always executed
        });
    } else {
      axios
        .delete(`/articles/${article.id}/users/${userId}/favorite`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          // handle success
          updateArticle(article.id);
        })
        .catch((error) => {
          // handle error
          console.log(error);
        })
        .then(() => {
          // always executed
        });
    }
  };

  const handleShowOptions = () => {
    showPostOptions ? setShowOptions(false) : setShowOptions(true);
  };

  useEffect(() => {
    let handlerClickOutside = (e) => {
      if (!postOptionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handlerClickOutside);

    return () => {
      document.removeEventListener("mousedown", handlerClickOutside);
    };
  });

  const votePost = (vote) => {
    const userId = jwt_decode(localStorage.getItem("token")).userId;
    if (article.votes.length == 0) {
      axios
        .post(
          `/articles/${article.id}/users/${userId}/vote`,
          {
            type: vote,
          },
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          // handle success
          updateArticle(article.id);
        })
        .catch((error) => {
          // handle error
          console.log(error);
        })
        .then(() => {
          // always executed
        });
    }
    if (article.votes.length && article.votes[0].type == vote) {
      axios
        .delete(`/articles/${article.id}/users/${userId}/vote`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          // handle success
          updateArticle(article.id);
        })
        .catch((error) => {
          // handle error
          console.log(error);
        })
        .then(() => {
          // always executed
        });
    }
    if (article.votes.length && article.votes[0].type != vote) {
      axios
        .patch(
          `/articles/${article.id}/users/${userId}/vote`,
          {
            type: vote,
          },
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          // handle success
          updateArticle(article.id);
        })
        .catch((error) => {
          // handle error
          console.log(error);
        })
        .then(() => {
          // always executed
        });
    }
  };

  const deletePost = () => {
    axios
      .delete(`/articles/${article.id}`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        // handle success
        deleteArticle(article.id);
      })
      .catch((error) => {
        // handle error
        console.log(error);
      })
      .then(() => {
        // always executed
      });
  };

  const changeStatus = () => {
    updateArticle(article.id);
  };

  return (
    <div className="post">
      {/* <video controls muted autoPlay>
                        <source src="https://backend.imp-act.ml/assets/videosArticles/7Oog2e1I_aOnSAr322I0U.mp4" type="video/mp4"></source>
                    </video> */}
      <div className="post__top">
        <div className="post__votes">
          {article.votes.length && article.votes[0].type == "UPVOTE" ? (
            <img
              onClick={() => votePost("UPVOTE")}
              src={upVote}
              alt="default-vote"
              className="post__votes-action post__votes-action--up"
            />
          ) : (
            <img
              onClick={() => votePost("UPVOTE")}
              src={defaultVote}
              alt="default-vote"
              className="post__votes-action post__votes-action--up"
            />
          )}

          {/* <BiUpvote
          onClick={() => votePost("UPVOTE")}
          className={`post__votes-action post__votes-action--up ${
            article.votes.length && article.votes[0].type == "UPVOTE"
              ? "post__votes-action--active-1"
              : ""
          }`}
        /> */}
          <span className="post__votes-number">{article.votePoints}</span>
          {article.votes.length && article.votes[0].type == "DOWNVOTE" ? (
            <img
              onClick={() => votePost("DOWNVOTE")}
              src={downVote}
              alt="default-vote"
              className="post__votes-action post__votes-action--down"
            />
          ) : (
            <img
              onClick={() => votePost("DOWNVOTE")}
              src={defaultVote}
              alt="default-vote"
              className="post__votes-action post__votes-action--down"
            />
          )}
          {/* <BiDownvote
          onClick={() => votePost("DOWNVOTE")}
          className={`post__votes-action post__votes-action--down ${
            article.votes.length && article.votes[0].type == "DOWNVOTE"
              ? "post__votes-action--active-2"
              : ""
          }`}
        /> */}
        </div>
        <div className="post__main">
          <div className="post__author">
            <img
              onClick={() => navigate("/user/" + article.author.id)}
              src={require(`../../assets/images/ranks/${rank.image}`)}
              alt=""
            />
            <div className="post__role-username">
              <span className="post__role" style={{ color: rank.color }}>
                {rank.type}
              </span>
              <Link
                to={`/user/${article.author.id}`}
                className="post__author-name"
              >
                {article.author.firstName} {article.author.lastName}
              </Link>
            </div>
            <div className="post__status">
              <Status
                status={article.status}
                id={article.id}
                changeStatus={changeStatus}
              />
            </div>
          </div>

          <span className="post__title">{article.title}</span>
          <p className="post__description">{article.description}</p>
          <div className="post__media">
            <MediaSlider media={article.articleGallery} />
          </div>
          <div className="post__actions" ref={postOptionsRef}>
            <button
              className="post__actions__button"
              onClick={() => navigate("/post/" + article.id)}
            >
              <VscComment className="post__actions__button__icon" />
              <span className="post__actions__button__text">
                {article._count.comments}{" "}
                {window.screen.width > 500 ? "Comentarii" : ""}
              </span>
            </button>
            <button className="post__actions__button" onClick={handleFavorite}>
              <MdOutlineFavorite
                className={`post__actions__button__icon ${
                  article.favorites.length && "favorite"
                }`}
              />
              <span
                className={`post__actions__button__text ${
                  article.favorites.length && "favorite"
                }`}
              >
                {window.screen.width > 500 ? "Favorite" : ""}
              </span>
            </button>
            {user.admin == true ||
            user.zoneRole != "CETATEAN" ||
            user.id == article.author.id ? (
              <button
                className="post__actions__button"
                onClick={handleShowOptions}
              >
                <MdMoreHoriz className="post__actions__button__icon" />
              </button>
            ) : (
              ""
            )}
            {showPostOptions && <PostOptions deletePost={deletePost} />}
          </div>
        </div>
      </div>
      <div className="post__comments">{comments ? comments : ""}</div>
    </div>
  );
};

export default Post;
