import React, { Component } from "react";
import { Text, View, Image, TouchableOpacity, FlatList } from "react-native";
import io from "socket.io-client";
import api from "../../services/api";

import styles from "./styles";

import camera from "../../assets/camera.png";
import more from "../../assets/more.png";
import send from "../../assets/send.png";
import like from "../../assets/like.png";
import comment from "../../assets/comment.png";

export default class Feed extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerRight: (
      <TouchableOpacity
        style={{ marginRight: 20 }}
        onPress={() => navigation.navigate("New")}
      >
        <Image source={camera} />
      </TouchableOpacity>
    )
  });

  state = {
    feed: []
  };

  async componentDidMount() {
    this.connectSocket();
    const response = await api.get("/posts");
    this.setState({ feed: response.data });
  }

  connectSocket = () => {
    const socket = io("http://192.168.0.102:3333");
    socket.on("post", newPost => {
      this.setState({ feed: [newPost, ...this.state.feed] });
    });

    socket.on("like", newPost => {
      this.setState({
        feed: this.state.feed.map(post =>
          post._id === newPost._id ? newPost : post
        )
      });
    });
  };

  handleLike = async id => {
    await api.post(`/posts/${id}/like`);
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.feed}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.feedItem}>
              <View style={styles.feedItemHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.name}> {item.author} </Text>
                  <Text style={styles.place}> {item.place} </Text>
                </View>
                <Image source={more} />
              </View>

              <Image
                style={styles.feedImage}
                source={{
                  uri: `http://192.168.0.102:3333/files/${item.image}`
                }}
              />

              <View style={styles.feedItemFooter}>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.action}
                    onPress={() => this.handleLike(item._id)}
                  >
                    <Image source={like} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.action} onPress={() => {}}>
                    <Image source={comment} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.action} onPress={() => {}}>
                    <Image source={send} />
                  </TouchableOpacity>
                </View>

                <Text syle={styles.like}> {item.likes} curtidas </Text>
                <Text syle={styles.description}> {item.description}</Text>
                <Text syle={styles.hashtags}> {item.hashtags} </Text>
              </View>
            </View>
          )}
        />
      </View>
    );
  }
}
