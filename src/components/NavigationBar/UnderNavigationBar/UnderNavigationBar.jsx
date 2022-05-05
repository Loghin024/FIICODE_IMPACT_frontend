import React, { useState } from "react";

import "./UnderNavigationBarStyles.scss";
import { ImpactStore } from "../../../store/ImpactStore";
import { useContext } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";




function UnderNavigationBarButton(props) {
  return (
    <button
      className={
        props.active
          ? "under-navigation-bar__button selected-unvb-b"
          : "under-navigation-bar__button"
      }
      id={props.id}
    >
      <a>{props.children}</a>
    </button>
  );
}

const UnderNavigationBar = () => {
  const search = useLocation();
  let routeFilter = search.pathname.substring(1);
  const { user, setUser } = useContext(ImpactStore);
  let navigate = useNavigate();
  const setDefaultBtn = ()=> {
    if (routeFilter != '') {
      let filterSplit = routeFilter.split("&").reverse();
        
        for (const el of filterSplit) {
          let elSplit = el.split("=");
          if (elSplit[0] == "localityId")
            return  elSplit[0] ;
          if (elSplit[0] == "villageId")
            return  elSplit[0] ;
          if (elSplit[0] == "countyId")
            return  elSplit[0] ;
          console.log({[elSplit[0]]:elSplit[1]}) 
      }
    } else {
      if(user.localityId) return "localityId";
      return "villageId";
    }
  };
  const [selectedButton, setSelectedButton] = useState(()=>setDefaultBtn());

  const handleSelectedButton = (e) => {
    e.preventDefault();
    const selected = e.target.closest(".under-navigation-bar__button").id;
    setSelectedButton(selected);
    navigate(`/${selected}=${user[selected]}`)
  };

  return (
    <>
      {user.zoneRole == "CETATEAN"&&!user.admin ? (
        <>
          <div className="under-navigation-bar" onClick={handleSelectedButton}>
            <UnderNavigationBarButton
              id="countyId"
              active={"countyId" === selectedButton}
            >
              <span className="under-navigation-bar__button__text">Judet</span>
            </UnderNavigationBarButton>
            <UnderNavigationBarButton
              id="villageId"
              active={"villageId" === selectedButton}
            >
              <span className="under-navigation-bar__button__text">
                {user.localityId ? "Comuna" : "Oras"}
              </span>
            </UnderNavigationBarButton>
            <UnderNavigationBarButton
              id="localityId"
              active={"localityId" === selectedButton}
            >
              <span className="under-navigation-bar__button__text">
                Localitate
              </span>
            </UnderNavigationBarButton>
          </div>
        </>
      ) : (
        ""
      )}
    </>
  );
};

export default UnderNavigationBar;
