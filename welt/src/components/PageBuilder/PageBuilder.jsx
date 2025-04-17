import NavChain from "../Navigation/NavChain/NavChain.jsx";

export default function PageBuilder({sideComponent, children, removePaddings=false, withNav=true, paths=[]}){
    return(
        <div className='contentContainer'>
            {sideComponent}
            <div className={`content ${removePaddings && "noPaddings"}`}>
                {withNav && <NavChain style={removePaddings? {paddingTop: "10px", paddingLeft: "10px"}: {}} paths={paths}/>}
                {children}
            </div>
        </div>
    )
}