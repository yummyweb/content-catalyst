import "./VideoThumbnail.css"
import Nav from "./Nav"

function VideoThumbnail({ img, viewCount }) {
    return (
        <div>
            <img src={img} />
            <p>{viewCount} views</p>
        </div>
    )
}

export default VideoThumbnail