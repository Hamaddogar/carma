import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Swal from 'sweetalert2';
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

// ------------------All Asyn Reducers are below ------------------//

let initialState = {
  adminIsActive: false,
  allActors: [],
  allActorsAdmin: [],
  status: null,
  registration: false,
  KYCApplyStatus: false,
  currentUserIsActive: false,
  currentUserIsAdmin: false,


  currentUserIsFreelancer: false,
  currentUserAllWorkedJobs: [],
  bidOnJobStatus: false,


  currentUserIsBuyer: false,
  currentUserAllPostedJobs: [],

  currentUser: {},
}

// ------------------All data Getter Setter Reducers ------------------//



// asyn defaultData
export const defaultData = createAsyncThunk(
  'mainSlice/defaultData',
  async () => {
    const data = await axios.get('/defaultData')
    return data.data;
  }
)

// asyn defaultAdminData
export const defaultAdminData = createAsyncThunk(
  'mainSlice/defaultAdminData',
  async () => {
    const data = await axios.get('/defaultadmindata')
    return data.data;
  }
)




// new Actor KYC dataHnadler
export const KYCApply = createAsyncThunk(
  'mainSlice/KYCApply',
  async ({ idFront, proofOfResidence, selfieWithID, firstName, LastName, dob, email, city, StateProvince, StreetAddressLine1, StreetAddressLine2, passportNumber, zipCode, sign, userMongoId }) => {
    const data = await axios.post('/actorkycapply', { idFront, proofOfResidence, selfieWithID, firstName, LastName, dob, email, city, StateProvince, StreetAddressLine1, StreetAddressLine2, passportNumber, zipCode, sign, userMongoId });
    return await data.data;
  }
)



// new Actor Registration
export const newActorRegistrar = createAsyncThunk(
  'mainSlice/newActorRegistrar',
  async ({ actorLoginId, actorLoginPassword, actorFirstName, actorLastName, actorDP, actorBio, actorRole, }) => {
    const data = await axios.post('/registration', { actorLoginId, actorLoginPassword, actorFirstName, actorLastName, actorDP, actorBio, actorRole, });
    return await data.data;
  }
)



// asyn Login
export const actorLogin = createAsyncThunk(
  'mainSlice/actorLogin',
  async ({ email, password }) => {
    const data = await axios.post('/login', { email, password })
    // console.log(data.data)
    return data.data;
  }
)

// Bid on Job
export const bidOnJob = createAsyncThunk(
  'mainSlice/bidOnJob',
  async ({ targetedJob, bidAmount, bidDescription, bidDuration, freelancerWhoApplied }) => {
    const data = await axios.post('/bidonjob', { targetedJob, bidAmount, bidDescription, bidDuration, freelancerWhoApplied })
    return data.data;
  }
);

// asyn post new Job
export const postNewJob = createAsyncThunk(
  'mainSlice/postNewJob',
  async ({ actorMongoId, jobPostedBy, jobTitle, jobPostedTime, jobDescription, jobBudget, jobDuration, jobSkills, }) => {
    const data = await axios.post('/postnewjob', { jobPostedBy, actorMongoId, jobTitle, jobPostedTime, jobDescription, jobBudget, jobDuration, jobSkills, })
    return data.data;
  }
);


// asyn Actor Refreasher
export const actorRefresher = createAsyncThunk(
  'mainSlice/actorRefresher',
  async (id) => {
    const data = await axios.post('/updateactordata', { actorMongoId: id });
    return data.data;
  }
)


// asyn Actor Refreasher
export const jobAssigner = createAsyncThunk(
  'mainSlice/jobAssigner',
  async ({job, freelancer, buyerId}) => {
    const data = await axios.post('/jobAssigner', {job, freelancer, buyerId});
    return data.data;
  }
)
























// asyn forgotpasswordHandler
export const forgotpasswordHandler = createAsyncThunk(
  'mainSlice/forgotpasswordHandler',
  async ({ email }) => {
    const data = await axios.post('/forgotpassword', { adminEmail: email });
    console.log('payload Forgot', data.data);
    return await data.data;
  }
)


// resetDone
export const resetDone = createAsyncThunk(
  'mainSlice/resetDone',
  async ({ newPassword, token }) => {
    const data = await axios.post('/restpassword', { newPassword, token })
    return data.data;
  }
)














// asyn setter
const mainSlice = createSlice({
  name: 'mainSlice',
  initialState,
  reducers: {
    LOG_OUT: (state) => {
      state.status = null;
      state.adminIsActive = false;
      state.registration = false;
      state.currentUserIsActive = false;
      state.currentUserIsFreelancer = false;
      state.currentUserIsAdmin = false;
      state.currentUserAllWorkedJobs = [];
      state.currentUserIsBuyer = false;
      state.currentUser = {};
      state.currentUserAllPostedJobs = [];
      state.KYCApplyStatus = false;
    },
  },
  extraReducers: {

    // ------------------Response Login ------------------//
    [actorLogin.pending]: (state, action) => {
      state.status = 'loading';
      Toast.fire({
        icon: 'info',
        title: 'Loading...'
      })
    },
    [actorLogin.fulfilled]: (state, { payload }) => {
      if (payload.success) {
        if (payload.user.actorRole === 'admin') {
          Toast.fire({ icon: 'success', title: payload.message });
          state.currentUserIsAdmin = true;
          state.currentUserIsActive = true;
          state.currentUserIsFreelancer = false;
          state.currentUserIsBuyer = false;
          state.currentUser = payload.user;
        } else if (payload.user.actorRole === 'freelancer') {
          Toast.fire({ icon: 'success', title: payload.message });
          state.currentUserIsAdmin = false;
          state.currentUserIsActive = true;
          state.currentUserIsFreelancer = true;
          state.currentUser = payload.user;
          state.currentUserIsBuyer = false;
          state.currentUserAllWorkedJobs = payload.user.jobsWorkedOn;
        } else if (payload.user.actorRole === 'buyer') {
          Toast.fire({ icon: 'success', title: payload.message });
          state.currentUserIsAdmin = false;
          state.currentUserIsActive = true;
          state.currentUserIsFreelancer = false;
          state.currentUser = payload.user;
          state.currentUserIsBuyer = true;
          state.currentUserAllPostedJobs = payload.user.jobsPosted;
        } else {
          Toast.fire({ icon: 'error', title: 'Unautherized Login Detected!' });
          state.currentUserIsAdmin = false;
          state.currentUserIsActive = false;
          state.currentUserIsFreelancer = false;
          state.currentUser = false;
          state.currentUserIsBuyer = false;
          state.currentUserAllPostedJobs = [];
          state.currentUserAllWorkedJobs = [];
        }

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `${payload.message}`,
        })
      }
    },
    [actorLogin.rejected]: (state, action) => {
      state.status = 'failed';
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Check Your Internet Connection!',
      })
    },


    // ------------------Response defaultData ------------------//

    [defaultData.pending]: (state) => {
      state.status = 'loading';
    },
    [defaultData.fulfilled]: (state, { payload }) => {
      if (payload.success) {
        state.allActors = payload.message;
        state.loader = false;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `${payload.message}`,
        })
      }
    },
    [defaultData.rejected]: (state) => {
      state.status = 'failed';
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Check Your Internet Connection!',
      })
    },



    // ------------------Response defaultAdminData ------------------//

    [defaultAdminData.pending]: (state) => {
      state.status = 'loading';
    },
    [defaultAdminData.fulfilled]: (state, { payload }) => {
      if (payload.success) {
        state.allActorsAdmin = payload.message;
        state.loader = false;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `${payload.message}`,
        })
      }
    },
    [defaultAdminData.rejected]: (state) => {
      state.status = 'failed';
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Check Your Internet Connection!',
      })
    },


    // ------------------Response Reset Password ------------------//
    [resetDone.pending]: (state, action) => {
      state.status = 'loading';
      Toast.fire({
        icon: 'info',
        title: 'Loading...'
      })
    },
    [resetDone.fulfilled]: (state, { payload }) => {
      if (payload.success) {
        Toast.fire({
          icon: 'success',
          title: 'Logged In Successfully'
        })
        state.resetRequest = true;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `${payload.message}`,
        })
      }
    },
    [resetDone.rejected]: (state, action) => {
      state.status = 'failed';
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Check Your Internet Connection!',
      })
    },

    // Forgort handler
    [forgotpasswordHandler.pending]: (state, action) => {
      Toast.fire({
        icon: 'success',
        title: '...Loading!',
      })
      state.status = 'loading';
    },
    [forgotpasswordHandler.fulfilled]: (state, { payload }) => {
      if (payload.success === true) {
        state.sendMail = payload.message;
        Toast.fire({
          icon: 'success',
          title: 'Email !',
          text: `${payload.message}`,
        })
        state.status = 'success';
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `${payload.message}`,
        })
        state.status = 'failed';
      }
    },
    [forgotpasswordHandler.rejected]: (state, action) => {
      state.status = 'failed';
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: ` Rejected! Failed to Send Mail`,
      })
    },


    // Reset Done 
    [resetDone.pending]: (state, action) => {
      state.status = 'loading';
      Toast.fire({
        icon: 'success',
        title: 'Loading ... !',
      })
      state.restDoneRes = false;
    },
    [resetDone.fulfilled]: (state, { payload }) => {
      if (payload.success === true) {
        state.restDoneRes = true;
        Toast.fire({
          icon: 'success',
          title: 'Reset !',
          text: `${payload.message}`,
        })
        state.status = 'success';
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `${payload.message}`,
        })
        state.status = 'failed';
        state.restDoneRes = false;
      }
    },
    [resetDone.rejected]: (state, action) => {
      state.status = 'failed';
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: ` Rejected! Failed to Reset Password`,
      })
    },






    // registgrarion handler 
    [newActorRegistrar.pending]: (state, action) => {
      state.status = 'loading';
      Toast.fire({
        icon: 'success',
        title: 'Loading ... !',
      })
      state.registration = false;
    },
    [newActorRegistrar.fulfilled]: (state, { payload }) => {
      if (payload.success) {
        Toast.fire({
          icon: 'success',
          title: 'Registered !',
          text: `${payload.message}`,
        })
        state.registration = true;
        state.status = 'success';
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `${payload.message}`,
        })
        state.status = 'failed';
        state.restDoneRes = false;
      }
    },
    [newActorRegistrar.rejected]: (state, action) => {
      state.status = 'failed';
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: ` Rejected! Failed to Reset Password`,
      })
    },









    // registgrarion handler 
    [KYCApply.pending]: (state, action) => {
      state.status = 'loading';
      Toast.fire({
        icon: 'success',
        title: 'Loading ... !',
      })
      state.KYCApplyStatus = false;
    },
    [KYCApply.fulfilled]: (state, { payload }) => {
      if (payload.success) {
        Toast.fire({
          icon: 'success',
          title: 'Registered !',
          text: `${payload.message}`,
        })
        state.KYCApplyStatus = true;
        state.status = 'success';
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `${payload.message}`,
        })
        state.status = 'failed';
        state.restDoneRes = false;
      }
    },
    [KYCApply.rejected]: (state, action) => {
      state.status = 'failed';
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: ` Rejected! Failed to Reset Password`,
      })
    },



    // bidOnJob handler
    [bidOnJob.pending]: (state, action) => {
      state.status = 'loading';
      Toast.fire({
        icon: 'success',
        title: 'Loading ... !',
      })
      state.bidOnJobStatus = false;
    },
    [bidOnJob.fulfilled]: (state, { payload }) => {
      if (payload.success) {
        Toast.fire({
          icon: 'success',
          title: 'Bid Success !',
          text: `${payload.message}`,
        })
        document.getElementById("bidplacer").reset();
        state.bidOnJobStatus = true;
        state.status = 'success';
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `${payload.message}`,
        })
        state.status = 'failed';
        state.restDoneRes = false;
      }
    },
    [bidOnJob.rejected]: (state, action) => {
      state.status = 'failed';
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: ` Check Your Internet Connection!`,
      })
    },








    // Post New Job handler
    [postNewJob.pending]: (state, action) => {
      state.status = 'loading';
      Toast.fire({
        icon: 'success',
        title: 'Loading ... !',
      })
      state.postNewJobStatus = false;
    },
    [postNewJob.fulfilled]: (state, { payload }) => {
      if (payload.success) {
        Toast.fire({
          icon: 'success',
          title: 'Success !',
          text: `${payload.message}`,
        })
        document.getElementById('newPostJob').reset();
        state.status = 'success';
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `${payload.message}`,
        })
        state.status = 'failed';
      }
    },
    [postNewJob.rejected]: (state, action) => {
      state.status = 'failed';
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: ` Check Your Internet Connection!`,
      })
    },




    // ------------------Response Refresher ------------------//
    [actorRefresher.fulfilled]: (state, { payload }) => {
      if (payload.success) {
        if (payload.user.actorRole === 'admin') {
          state.currentUserIsAdmin = true;
          state.currentUserIsActive = true;
          state.currentUserIsFreelancer = false;
          state.currentUserIsBuyer = false;
          state.currentUser = payload.user;
        } else if (payload.user.actorRole === 'freelancer') {
          console.log('freelancer', payload.user);
          state.currentUser = payload.user;
          state.currentUserAllWorkedJobs = payload.user.jobsWorkedOn;
        } else if (payload.user.actorRole === 'buyer') {
          state.currentUser = payload.user;
          state.currentUserAllPostedJobs = payload.user.jobsPosted;
        } else {
          Toast.fire({ icon: 'error', title: 'Unautherized Login Detected!' });
          state.currentUserIsAdmin = false;
          state.currentUserIsActive = false;
          state.currentUserIsFreelancer = false;
          state.currentUser = false;
          state.currentUserIsBuyer = false;
          state.currentUserAllPostedJobs = [];
          state.currentUserAllWorkedJobs = [];
        }

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `${payload.message}`,
        })
      }
    },
    [actorRefresher.rejected]: (state, action) => {
      state.status = 'failed';
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Check Your Internet Connection!',
      })
    },






    // ------------------Response Refresher ------------------//
    [jobAssigner.pending]: (state, action) => {
      state.status = 'loading';
      Toast.fire({
        icon: 'success',
        title: 'Loading ... !',
      })
      state.postNewJobStatus = false;
    },
    [jobAssigner.fulfilled]: (state, { payload }) => {
      if (payload.success) {
        Toast.fire({
          icon: 'success',
          title: 'Assigned ',
        })

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `${payload.message}`,
        })
      }
    },
    [jobAssigner.rejected]: (state, action) => {
      state.status = 'failed';
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Check Your Internet Connection!',
      })
    },




















































    // end of all Extra Reducers reducers
  },
})











export const { LOG_OUT } = mainSlice.actions;



// ------------------All Asyn Getter Setter Reducers Exporter ------------------//

export const mainReducer = mainSlice.reducer;

