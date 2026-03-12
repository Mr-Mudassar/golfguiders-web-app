import { gql } from '@apollo/client';

export const GolfCoursesByDistance = gql`
  query GolfCoursesByDistance(
    $latitude: Float
    $longitude: Float
    $distance: Float
    $courseName: String
  ) {
    getGolfCoursesByDistance(
      latitude: $latitude
      longitude: $longitude
      distance: $distance
      golfCourseName: $courseName
    ) {
      id
      id_course
      coursename
      teetimesavailable
      active
      classification
      address1
      latitude
      longitude
    }
  }
`;

export const GET_USER_POST_BY_POSTID = gql`
  query GetUserPostDetails($userId: String!, $created: String!) {
    getUserPostDetail(userId: $userId, created: $created) {
      user_id
      postal_code
      geohash
      friend_id
      postid
      created
      comment_count
      background_color
      date_from
      date_to
      description
      feeling_emoji
      has_buddy_accepted
      is_draft
      latitude
      longitude
      location
      modified
      golfcourse_json
      shared_by_user_id
      shared_of_user_id
      shared_by_postid
      shared_at
      status
      tee_time
      visibility
      has_media
      thumbnail_preview
      title
      type
      user_favorites
      user_likes
      user_saves
      user_shares
      user_tags
      group_tags
      youtube_url
      youtube_channel_name
      userInfo {
        first_name
        last_name
        photo_profile
      }
      sharedOfUserInfo {
        first_name
        last_name
        photo_profile
      }
    }
  }
`;

export const COURSE_GPS_DETAILS = gql`
  query ($id_course: String!) {
    getGolfCourseCoordinates(id_course: $id_course) {
      golfCourseCoordinates {
        id
        id_course
        holenumber
        frontlat
        frontlon
        centerlat
        centerlon
        backlat
        backlon
        teelat1
        teelon1
        teelat2
        teelon2
        teelat3
        teelon3
        teelat4
        teelon4
        teelat5
        teelon5
        customlat1
        customlon1
        customname1
        customdesc1
        customlat2
        customlon2
        customname2
        customdesc2
        customlat3
        customlon3
        customname3
        customdesc3
        customlat4
        customlon4
        customname4
        customdesc4
      }
      golfCourseTeeDetails {
        id_course
        teename
        display_order
        teeslist
        ydshole
        gender
        ratingmen
        ratingwomen
        slopewomen
        slopemen
        id_courseteetype
        id_courseteecolor
        teecolorname
        teecolorvalue
        ydstotal
        yds1to9
        yds10to18
        yds1to18
      }
      golfCourseScorecard {
        men_hcp_hole
        men_par_hole
        id_course
        status
        men_par_out
        men_par_in
        men_par_total
        wmn_hcp_hole
        wmn_par_hole
        wmn_par_out
        wmn_par_in
        wmn_par_total
      }
    }
  }
`;

export const CourseHoles = gql`
  query getHoles($id_course: String!) {
    getHoleCountByCourse(id_course: $id_course)
  }
`;
