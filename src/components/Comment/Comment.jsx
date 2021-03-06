import "./CommentStyles.scss";
import { BsFillReplyAllFill } from "react-icons/bs";
import { useState, useContext } from "react";
import axios from "../../assets/axios/axios";
import { useParams } from "react-router-dom";
import { MdDeleteForever } from "react-icons/md";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { ImpactStore } from "../../store/ImpactStore";
import rankPerform from "../../utils/rank";
import { useEffect } from "react";


const Comment = ({ data, replies, updateArticle, updateComments }) => {
  console.log(data);
  
  const timeConverter = (UNIX_timestamp) => {
    let a = new Date(UNIX_timestamp);
    let months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let year = a.getFullYear();
    let month = months[a.getMonth()];
    let date = a.getDate();
    let hour = a.getHours();
    if (hour < 10) hour = ("0" + hour).slice(-2);
    let min = a.getMinutes();
    if (min < 10) min = ("0" + hour).slice(-2);
    let sec = a.getSeconds();
    if (sec < 10) sec = ("0" + hour).slice(-2);
    let time =
      date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
    return time;
  };
  const { user, setUser } = useContext(ImpactStore);
  const { id } = useParams();
  const [reply, setReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [rank, setRank] = useState(
    data.author.monthlyPoints>=0 ? ()=>rankPerform(data.author.monthlyPoints, data.roleUser, data.admin)
    :{
      type:"Cetatean",
      color:"black",
      image:"default.jpg"
    }
    );
  const addComment = () => {
    axios
      .post(
        `/articles/${id}/comments`,
        {
          commentId: data.id,
          text: replyText,
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
        updateComments();
        updateArticle(id);
        setReply(false);
        setReplyText("");
      })
      .catch((error) => {
        // handle error
        console.log(error);
      })
      .then(() => {
        // always executed
      });
  };

  const deleteComment = ()=> {
    axios
    .delete(
      `/articles/${id}/comments/${data.id}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
    .then((response) => {
      // handle success
      updateComments();
      updateArticle(id);
      setReply(false);
      setReplyText("");
    })
    .catch((error) => {
      // handle error
      console.log(error);
    })
    .then(() => {
      // always executed
    });
  }

  // const showRemoveComment = ()=> {
  //   if(user.id == data.authorId) return true;
  //   if(user.admin == true) return true;
  // }

  // useEffect(()=> {
  //   console.log(data);
  // })

  return (
    <div className="comment">
      <div className="comment__info">
        <img src={require(`../../assets/images/ranks/${rank.image}`)} alt="avatar" />
        <div className="comment__user">
          <span className="comment__role" style={{color:rank.color}}>{rank.type}</span>
          <span className="comment__name">
            {data.author.firstName} {data.author.lastName}
          </span>
        </div>
        {user.id == data.authorId || user.zoneRole != "CETATEAN"|| user.admin ? (
          <>
            <IconButton aria-label="delete" className="comment__delete" onClick={deleteComment}>
              <DeleteIcon />
            </IconButton>
          </>
        ) : (
          ""
        )}
        {/* <MdDeleteForever className="comment__delete"/> */}
        {/* <span className="comment__bullet">&#8226;</span> */}
        {/* <span className="comment__role"> {data.roleUser}</span> */}
        {/* <span className="comment__bullet">&#8226;</span>
                <span className="comment__time">{timeConverter(data.createTime)}</span> */}
      </div>
      <div className="comment__data">
        <span className="comment__text">
          {data.parrentComment ? (
            <span className="comment__text-parrent">
              @{data.parrentComment.author.firstName}{" "}
              {data.parrentComment.author.lastName}&nbsp;
            </span>
          ) : (
            ""
          )}
          {data.text}
        </span>
        <div className="comment__reply">
          <span onClick={() => setReply(!reply)}>
            Raspunde <BsFillReplyAllFill />
          </span>
          {reply ? (
            <>
              {" "}
              <textarea
                className="comment__reply-textarea input-default"
                placeholder="Ce parere ai?"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              ></textarea>
              <div className="comment__actions">
                <button
                  className="comment__add-btn button-default-form"
                  onClick={addComment}
                >
                  Adauga
                </button>
              </div>
            </>
          ) : (
            ""
          )}
        </div>
        {replies && replies.length ? replies : ""}
      </div>
    </div>
  );
};

export default Comment;
