1. There is one owner per one channel. This is assumed in channelDetailsV1 since there is only one owner in ownerMembers array (and this owner is included in channelCreateV1).
2. Owner belongs to ownerMembers and allMembers at the same time.
3. Details of private channels are only visible to members of that channel.
4. Function calls will be given the correct data types in the correct order in the functions arguments
5. Both userId and channelId will never repeat
6. Users email and authorised user id will never repeat
7. For channelListallV1, if authUserId is invalid, return error or null since unauthorized user shouldn't have access to channels.
8. A user joined by channelJoinV1 is classified as member so they join in allMembers, not ownerMembers

Iteration 3
1. There is only one owner of DM, and when that owner is removed with userRemove, dmOwner becomes null.