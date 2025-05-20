import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const isLoggedIn = async (req, res, next) => {

  try {
    console.log(req.cookies);
    let { accessToken, refreshToken } = req.cookies;

    // console.log(`${accessToken} : ${refreshToken}`)

    if (!accessToken) {

      if (!refreshToken) {
        res.status(404)
          .json({
            "message": "Unauthorized: Token not provided. Please log in",
            "success": false
          })
      }
      const refreshDecoded = jwt.verify(refreshToken, process.env.REFRESHTOKEN_SECRET)

      const user = await User.findOne({
        _id: refreshDecoded.id
      })

      if (!user) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized access",
        });
      }

      const newAccessToken = await jwt.sign(
        { id: user._id, role: user.role },
        process.env.ACCESSTOKEN_SECRET,
        {
          expiresIn: "2m",
        }
      );

      const newRefreshToken = await jwt.sign(
        { id: user._id, role: user.role },
        process.env.REFRESHTOKEN_SECRET,
        {
          expiresIn: "1D",
        }
      );

      user.refreshToken = newRefreshToken;
      await user.save();

      const cookieOptions = {
        httpOnly: true,
      };

      res.cookie("accesToken", newAccessToken, cookieOptions);
      res.cookie("refreshToken", newRefreshToken, cookieOptions);

      req.user = refreshDecoded
      next()

    } else {

      const accessDecoded = jwt.verify(accessToken, process.env.ACCESSTOKEN_SECRET)

      const user = await User.findOne({ _id: accessDecoded.id })
      if (!user) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized access",
        });
      }


      const newAccessToken = await jwt.sign(
        { id: user._id, role: user.role },
        process.env.ACCESSTOKEN_SECRET,
        {
          expiresIn: "2m",
        }
      );

      const newRefreshToken = await jwt.sign(
        { id: user._id, role: user.role },
        process.env.REFRESHTOKEN_SECRET,
        {
          expiresIn: "1D",
        }
      );

      user.refreshToken = newRefreshToken
      await user.save()

      const cookieOptions = {
        httpOnly: true,
      };

      res.cookie("accesToken", newAccessToken, cookieOptions);
      res.cookie("refreshToken", newRefreshToken, cookieOptions);

      console.log(accessDecoded)

      req.user = accessDecoded
  
      next()

    }

  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(400)
      .json({
        "message": "Internal server error",
        "success": false
      })
  }

};

export default isLoggedIn